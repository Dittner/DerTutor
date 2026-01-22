import { RXObservableValue } from 'flinker'
import { ServerConnectionVM } from './ui/view/connect/ServerConnectionVM'
import { NoteListVM } from './ui/view/note/NoteListVM'
import { IViewModel } from './ui/view/ViewModel'
import { VocListVM } from './ui/view/vocs/VocListVM'
import { EditorVM } from './ui/view/editor/EditorVM'
import { ILang, IUser } from './domain/DomainModel'
import { globalContext } from './App'
import { log, logErr } from './app/Logger'
import { Locale } from './app/LocaleManager'

export interface Message {
  readonly level?: 'warning' | 'error' | 'info'
  readonly text: string
}

export class DerTutorContext {
  static readonly PAGE_SIZE = 20
  readonly $activeVM = new RXObservableValue<IViewModel | undefined>(undefined)

  readonly connectionVM: ServerConnectionVM
  readonly vocListVM: VocListVM
  readonly noteListVM: NoteListVM
  readonly editorVM: EditorVM

  readonly $user = new RXObservableValue<IUser | undefined>(undefined)
  readonly $allLangs = new RXObservableValue<ILang[]>([])
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)
  readonly router: DerTutorRouter

  static self: DerTutorContext

  static init() {
    if (DerTutorContext.self === undefined)
      DerTutorContext.self = new DerTutorContext()
    return DerTutorContext.self
  }

  private constructor() {
    log('new DertutorContext')
    this.connectionVM = new ServerConnectionVM(this)
    this.vocListVM = new VocListVM(this)
    this.noteListVM = new NoteListVM(this)
    this.editorVM = new EditorVM(this)

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
        globalContext.localeManager.$locale.value = langCode
      })
      .subscribe()

    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown(e: KeyboardEvent): void {
    if (document.activeElement?.tagName !== 'INPUT')
      this.$activeVM.value?.onKeyDown(e)
  }
}

export class DerTutorRouter {
  constructor(ctx: DerTutorContext) {
    globalContext.navigator.$keys.pipe()
      .onReceive(keys => {
        let newVM: IViewModel
        if (!globalContext.server.$isServerAvailable.value)
          newVM = ctx.connectionVM
        else if (keys.noteId && keys.edit)
          newVM = ctx.editorVM
        else if (keys.langCode && (keys.vocCode || keys.searchKey !== undefined))
          newVM = ctx.noteListVM
        else
          newVM = ctx.vocListVM

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