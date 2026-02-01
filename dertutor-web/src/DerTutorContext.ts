import { RXObservableValue } from 'flinker'
import { ServerConnectionVM } from './ui/view/connect/ServerConnectionVM'
import { NoteListVM } from './ui/view/note/NoteListVM'
import { IViewModel } from './ui/view/ViewModel'
import { VocListVM } from './ui/view/vocs/VocListVM'
import { EditorVM } from './ui/view/editor/EditorVM'
import { ILang, IUser } from './domain/DomainModel'
import { globalContext } from './App'
import { log, logErr } from './app/Logger'
import { Locale, localeManager } from './app/LocaleManager'
import { LabVM } from './ui/view/lab/LabVM'
import { MarkdownVM } from './ui/view/md/MarkdownVM'

export interface Message {
  readonly level?: 'warning' | 'error' | 'info'
  readonly text: string
}

export class DerTutorContext {
  static readonly PAGE_SIZE = 20
  readonly $activeVM = new RXObservableValue<IViewModel | undefined>(undefined)

  readonly $user = new RXObservableValue<IUser | undefined>(undefined)
  readonly $allLangs = new RXObservableValue<ILang[]>([])
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)
  readonly router: DerTutorRouter
  readonly vmFactory: LazyVMFctory

  static self: DerTutorContext

  static init() {
    if (DerTutorContext.self === undefined)
      DerTutorContext.self = new DerTutorContext()
    return DerTutorContext.self
  }

  private constructor() {
    log('new DertutorContext')
    this.vmFactory = new LazyVMFctory(this)
    this.router = new DerTutorRouter(this)

    globalContext.server.$isUserAuthenticated.pipe().onReceive(value => {
      if (!value)
        this.$user.value = undefined
    })

    globalContext.server.loadCurrentUser().pipe()
      .onReceive(value => {
        this.$user.value = value
      }).onError(e => {
        logErr('User not loaded, err:', e)
      })
      .subscribe()

    globalContext.navigator.$keys.pipe()
      .map(keys => keys.langCode as Locale)
      .skipNullable()
      .removeDuplicates()
      .onReceive(langCode => {
        localeManager.$locale.value = langCode
      })
      .subscribe()

    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown(e: KeyboardEvent): void {
    if (document.activeElement?.tagName !== 'INPUT')
      this.$activeVM.value?.onKeyDown(e)
  }
}

export class LazyVMFctory {
  private ctx: DerTutorContext
  constructor(ctx: DerTutorContext) {
    this.ctx = ctx
  }

  private _connectionVM?: ServerConnectionVM
  getConnectionVM(): ServerConnectionVM {
    if (!this._connectionVM) this._connectionVM = new ServerConnectionVM(this.ctx)
    return this._connectionVM
  }

  private _vocListVM?: VocListVM
  getVocListVM(): VocListVM {
    if (!this._vocListVM) this._vocListVM = new VocListVM(this.ctx)
    return this._vocListVM
  }

  private _noteListVM?: NoteListVM
  getNoteListVM(): NoteListVM {
    if (!this._noteListVM) this._noteListVM = new NoteListVM(this.ctx)
    return this._noteListVM
  }

  private _editorVM?: EditorVM
  getEditorVM(): EditorVM {
    if (!this._editorVM) this._editorVM = new EditorVM(this.ctx)
    return this._editorVM
  }

  private _labVM?: LabVM
  getLabVM(): LabVM {
    if (!this._labVM) this._labVM = new LabVM(this.ctx)
    return this._labVM
  }

  private _markdownVM?: MarkdownVM
  getMarkdownVM(): MarkdownVM {
    if (!this._markdownVM) this._markdownVM = new MarkdownVM(this.ctx)
    return this._markdownVM
  }
}

export class DerTutorRouter {
  constructor(ctx: DerTutorContext) {
    globalContext.navigator.$keys.pipe()
      .onReceive(keys => {
        let newVM: IViewModel
        if (!globalContext.server.$isServerAvailable.value)
          newVM = ctx.vmFactory.getConnectionVM()
        else if (keys.module === 'lab')
          newVM = ctx.vmFactory.getLabVM()
        else if (keys.module === 'md')
          newVM = ctx.vmFactory.getMarkdownVM()
        else if (keys.noteId && keys.edit)
          newVM = ctx.vmFactory.getEditorVM()
        else if (keys.langCode && (keys.vocCode || keys.searchKey !== undefined))
          newVM = ctx.vmFactory.getNoteListVM()
        else
          newVM = ctx.vmFactory.getVocListVM()

        if (ctx.$activeVM.value !== newVM) {
          ctx.$activeVM.value?.deactivate()
          ctx.$activeVM.value = newVM
          newVM.activate()
        }

        ctx.$activeVM.value.urlDidChange(keys)
      })
      .subscribe()
  }
}