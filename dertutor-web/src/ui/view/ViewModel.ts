import { RXObservableValue, RXOperation } from "flinker"
import { DerTutorContext } from "../../DerTutorContext"
import { Action, ActionsList, parseKeyToCode } from "../actions/Action"
import { themeManager } from "../theme/ThemeManager"
import { UrlKeys, URLNavigator } from "../../app/URLNavigator"
import { globalContext } from "../../App"
import { DertutorServer } from "../../backend/DertutorServer"
import { Interactor } from "./Interactor"
import { InputBufferController } from "../controls/Input"
import { AuthenticateSchema } from "../../backend/Schema"
import { IUser } from "../../domain/DomainModel"

export type ViewModelID = 'connection' | 'vocs' | 'notes' | 'editor'
export interface IViewModel {
  readonly id: ViewModelID
  readonly $showActions: RXObservableValue<boolean>
  readonly $cmd: RXObservableValue<string>
  readonly inputMode: InputMode
  readonly actionsList: ActionsList
  lastExecutedAction: Action | undefined
  onKeyDown(e: KeyboardEvent): void
  urlDidChange(keys: UrlKeys): void
  activate(): void
  deactivate(): void
}

export class ViewModel<ViewModelState> implements IViewModel {
  readonly id: ViewModelID
  readonly ctx: DerTutorContext
  readonly navigator: URLNavigator
  readonly interactor: Interactor<ViewModelState>
  readonly server: DertutorServer

  readonly $showActions = new RXObservableValue(false)
  readonly $cmd = new RXObservableValue('')
  readonly inputMode = new InputMode()
  readonly actionsList = new ActionsList()
  lastExecutedAction: Action | undefined = undefined

  constructor(id: ViewModelID, ctx: DerTutorContext, interactor: Interactor<ViewModelState>) {
    this.id = id
    this.ctx = ctx
    this.navigator = globalContext.navigator
    this.server = globalContext.server

    this.interactor = interactor
    interactor.$state.pipe()
      .skipFirst()
      .onReceive(s => this.stateDidChange(s))
  }

  get isActive(): boolean {
    return this.ctx.$activeVM.value?.id == this.id
  }

  activate(): void {
    console.log(`VM <${this.id}> is activated`)
    this.interactor.clearCache()
  }

  deactivate(): void {
    this.$cmd.value = ''
    this.inputMode.cancel()
    this.lastExecutedAction = undefined
  }

  urlDidChange(keys: UrlKeys): void {
    this.interactor.run(keys)
  }

  protected stateDidChange(state: ViewModelState) { }

  addDefaultKeybindings(): void {
    this.actionsList.add('?', 'Show list of actions', () => this.showActions())
    this.actionsList.add('<ESC>', 'Hide actions/Clear messages', () => {
      this.$showActions.value = false
      this.ctx.$msg.value = undefined
    })
    this.actionsList.add('T', 'Switch theme', () => {
      themeManager.toggleTheme()
      this.ctx.$msg.value = { 'level': 'info', 'text': themeManager.$theme.value.id + ' theme' }
    })
    this.actionsList.add(':auth<CR>', 'Login', () => this.signIn())
    this.actionsList.add(':logout<CR>', 'Logout', () => this.signOut())
    this.actionsList.add('.', 'Repeat last action', () => this.lastExecutedAction?.handler())
  }

  private cmdBuffer = ''
  async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (!this.isActive || this.actionsList.actions.length === 0 || e.key === 'Shift') return
    //console.log('key:', e.key, ', code:', e.code, ', keycode:', e.keyCode)

    if (this.inputMode.$isActive.value) {
      this.inputMode.onKeyDown(e)
      e.preventDefault()
      return
    }

    const code = parseKeyToCode(e)
    this.cmdBuffer += code

    const a = this.actionsList.find(this.cmdBuffer)
    if (a) {
      if (this.cmdBuffer !== '.')
        this.lastExecutedAction = a
      this.cmdBuffer = ''
      this.$cmd.value = this.lastExecutedAction?.cmd ?? ''
      a.handler()
      e.preventDefault()
    } else if (this.actionsList.some(this.cmdBuffer)) {
      e.preventDefault()
      this.$cmd.value = this.cmdBuffer
    } else {
      this.$cmd.value = ''
      this.cmdBuffer = ''
    }
  }

  private showActions() {
    this.$showActions.value = true
    this.ctx.$msg.value = { text: 'Shortkeys (Press ESC to hide)' }
  }

  private async signIn() {
    if (this.inputMode.$isActive.value) return
    if (this.ctx.$user.value) {
      this.ctx.$msg.value = { text: 'Already authenticated' }
      return
    }

    const username = await this.inputMode.activate('Username:', '').asAwaitable
    if (username.isCanceled) return
    const password = await this.inputMode.activate('Password:', '', true).asAwaitable
    if (password.isCanceled) return

    const name = username.value.trim()
    const pwd = password.value.trim()

    if (name && pwd) {
      const schema = { username: name, password: pwd } as AuthenticateSchema
      this.server.signIn(schema).pipe()
        .onReceive((user: IUser) => {
          console.log('ViewModel:signIn, success:', user)
          if (user) {
            this.ctx.$msg.value = { text: 'authenticated' }
            this.ctx.$user.value = user
          } else {
            this.ctx.$msg.value = { text: 'not authenticated' }
            this.ctx.$user.value = undefined
          }
        })
        .onError(e => {
          const msg = e.message.indexOf('duplicate key') !== -1 ? 'Note already exists' : e.message
          this.ctx.$msg.value = { level: 'error', text: msg }
        })
        .subscribe()
    } else {
      this.ctx.$msg.value = { level: 'warning', text: 'Empty name or password not allowed' }
    }
  }

  private async signOut() {
    if (this.ctx.$user.value) {
      this.server.signOut().pipe()
        .onReceive(_ => {
          this.ctx.$msg.value = { text: 'logged out' }
          this.ctx.$user.value = undefined
        })
        .onError(e => {
          const msg = e.message.indexOf('duplicate key') !== -1 ? 'Note already exists' : e.message
          this.ctx.$msg.value = { level: 'error', text: msg }
        })
        .subscribe()
    } else {
      this.ctx.$msg.value = { level: 'warning', text: 'Already logged out' }
    }
  }
}

export interface InputModeResult {
  value: string
  isCanceled: boolean
}

class InputMode {
  readonly $isActive = new RXObservableValue(false)
  readonly bufferController = new InputBufferController()
  private op: RXOperation<InputModeResult, never> | undefined = undefined

  private _name = ''
  get name() { return this._name }

  private _isSecure = false
  get isSecure() { return this._isSecure }


  constructor() { }

  async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (!this.op) return
    const code = parseKeyToCode(e)
    if (code === '<ESC>') {
      this.cancel()
    } else if (code === '<CR>') {
      this.success()
    } else if (code === '<C-v>') {
      await this.bufferController.pasteFromKeyboard()
    } else {
      this.bufferController.onKeyDown(e)
    }
  }

  activate(name: string, value: string, secure: boolean = false): RXOperation<InputModeResult, never> {
    if (this.op && !this.op.isComplete)
      throw new Error('InputMode is already active')

    this._name = name
    this._isSecure = secure
    this.bufferController.reset(value)
    this.$isActive.value = true

    this.op = new RXOperation<InputModeResult, never>()
    return this.op
  }

  cancel() {
    if (this.op && !this.op.isComplete) {
      this.op.success({ value: this.bufferController.$buffer.value, isCanceled: true })
      this.op = undefined
      this.$isActive.value = false
    }
  }

  success() {
    this.op?.success({ value: this.bufferController.$buffer.value, isCanceled: false })
    this.op = undefined
    this.$isActive.value = false
  }
}