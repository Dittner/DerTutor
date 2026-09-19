import { RXObservableValue } from "flinker"

import { ViewModel } from "../ViewModel"
import { Interactor } from "../Interactor"
import { log } from "../../../app/Logger"
import { globalContext } from "../../../App"
import { QuickSearchController } from "../../controls/QuickSearch"

export interface MarkdownState { }

const TEXT_KEY = 'MDVM:TEXT__KEY'
const SCROLLY_KEY = 'MDVM:SCROLLY_KEY'

const DEF_TEXT = `Режим _Markdown_ позволяет читать текст, не отвлекаясь на поиск незнакомого иностранного слова. Вам не нужно постоянно переключаться между текстом и словарем в отдельной вкладке или приложении.

## Как этим пользоваться?
\`\`\`ol
1. Вставьте в редактор текст на немецком или английском языке;
1. Выключите режим редактирования: Edit Mode — off (ESC);
1. Выделите слово (e.g. Tipp) и нажимете слэш; слово добавится в поле быстрого поиска;
1. При необходимости отредактиуйте слово в поле ввода и нажмите Enter;
1. Если слово есть в словаре, то будет показан его перевод;
1. При необходимости измените язык (de|en);
1. Чтобы включить режим редактирование нажмите: e;
1. Введённый текст сохраняется после перезагрузки страницы.
\`\`\``

export class MarkdownVM extends ViewModel<MarkdownState> {
  readonly $state = new RXObservableValue<Readonly<MarkdownState>>({})
  readonly $text = new RXObservableValue('')
  readonly $editMode = new RXObservableValue(false)

  readonly quiclSearchController: QuickSearchController

  constructor() {
    const interactor = new MarkdownInteractor()
    super('md', interactor)
    this.addKeybindings()

    this.quiclSearchController = new QuickSearchController(true)

    this.$text.value = globalContext.localStorage.read(TEXT_KEY) || DEF_TEXT

    this.$text.pipe()
      .skipFirst()
      .onReceive(value => {
        globalContext.localStorage.write(TEXT_KEY, value)
      })
      .subscribe()

    this.ctx.app.$scrollY.pipe()
      .debounce(1000)
      .skipFirst()
      .onReceive(value => {
        if (this.isActive)
          globalContext.localStorage.write(SCROLLY_KEY, value)
      })
      .subscribe()
  }

  private addKeybindings() {
    this.addDefaultKeybindings()
    this.actionsList.add('/', 'Quick Search', () => this.quiclSearchController.focus())
    this.actionsList.add('<Space>', 'Play audio', () => this.quiclSearchController.playAudio())
    this.actionsList.add('e', 'Edit', () => this.$editMode.value = true)
    this.actionsList.add('<BS>', 'Go back', () => this.goBack())
  }

  override didPressESC() {
    super.didPressESC()
    this.quiclSearchController.clear()
  }

  override onKeyDown(e: KeyboardEvent) {
    if (!this.$editMode.value || !(document.activeElement instanceof HTMLTextAreaElement))
      super.onKeyDown(e)
  }

  override activate(): void {
    super.activate()
    log('Markdown, scroll to 1000')
    setTimeout(() => {
        window.scrollTo(0, globalContext.localStorage.read(SCROLLY_KEY) ?? 0)
      }, 24)
  }

  goBack() {
    this.navigator.navigateBack()
  }
}

class MarkdownInteractor extends Interactor<MarkdownState> {
  constructor() {
    super()
    log('new MarkdownInteractor')
  }
}
