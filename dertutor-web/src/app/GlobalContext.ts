import { RXObservableValue } from "flinker"
import { DertutorServer } from "../backend/DertutorServer"
import { Application } from "./Application"
import { KeyValueStore } from "./KeyValueStore"
import { URLNavigator } from "./URLNavigator"
import { generateUID } from "./Utils"
import { IViewModel } from "../ui/view/ViewModel"
import { ILang, IUser } from "../domain/DomainModel"
import { logErr } from "./Logger"
import { Locale, localeManager } from "./LocaleManager"
import { ServerConnectionVM } from "../ui/view/connect/ServerConnectionVM"
import { VocListVM } from "../ui/view/vocs/VocListVM"
import { NoteListVM } from "../ui/view/note/NoteListVM"
import { LabVM } from "../ui/view/lab/LabVM"
import { EditorVM } from "../ui/view/editor/EditorVM"


export class GlobalContext {
  readonly uid = generateUID()
  readonly app: Application
  readonly server: DertutorServer
  readonly navigator: URLNavigator
  readonly localStorage: KeyValueStore

  static readonly PAGE_SIZE = 20
  readonly $activeVM = new RXObservableValue<IViewModel | undefined>(undefined)

  readonly $user = new RXObservableValue<IUser | undefined>(undefined)
  readonly $allLangs = new RXObservableValue<ILang[]>([])
  readonly $msg = new RXObservableValue<Message | undefined>(undefined)
  readonly router: Router
  readonly vmFactory: LazyVMFctory

  static self: GlobalContext

  static init() {
    if (GlobalContext.self === undefined) {
      GlobalContext.self = new GlobalContext()
    }
    return GlobalContext.self
  }

  private constructor() {
    this.app = new Application()
    this.localStorage = new KeyValueStore('derTutorLocalStore')
    this.navigator = new URLNavigator(this.app)
    this.server = new DertutorServer()

    this.vmFactory = new LazyVMFctory()
    this.router = new Router(this)

    this.server.$isUserAuthenticated.pipe().onReceive(value => {
      if (!value)
        this.$user.value = undefined
    })

    this.server.loadCurrentUser().pipe()
      .onReceive(value => {
        this.$user.value = value
      }).onError(e => {
        logErr('User not loaded, err:', e)
      })
      .subscribe()

    this.navigator.$keys.pipe()
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
    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      this.$activeVM.value?.onKeyDown(e)
    }
  }
}

export interface Message {
  readonly level?: 'warning' | 'error' | 'info'
  readonly text: string
}

export class LazyVMFctory {
  private _connectionVM?: ServerConnectionVM
  getConnectionVM(): ServerConnectionVM {
    if (!this._connectionVM) this._connectionVM = new ServerConnectionVM()
    return this._connectionVM
  }

  private _vocListVM?: VocListVM
  getVocListVM(): VocListVM {
    if (!this._vocListVM) this._vocListVM = new VocListVM()
    return this._vocListVM
  }

  private _noteListVM?: NoteListVM
  getNoteListVM(): NoteListVM {
    if (!this._noteListVM) this._noteListVM = new NoteListVM()
    return this._noteListVM
  }

  private _editorVM?: EditorVM
  getEditorVM(): EditorVM {
    if (!this._editorVM) this._editorVM = new EditorVM()
    return this._editorVM
  }

  private _labVM?: LabVM
  getLabVM(): LabVM {
    if (!this._labVM) this._labVM = new LabVM()
    return this._labVM
  }
}

export class Router {
  constructor(ctx: GlobalContext) {
    ctx.navigator.$keys.pipe()
      .debounce(1)
      .onReceive(keys => {
        let newVM: IViewModel
        if (!ctx.server.$isServerAvailable.value)
          newVM = ctx.vmFactory.getConnectionVM()
        else if (keys.module === 'lab')
          newVM = ctx.vmFactory.getLabVM()
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