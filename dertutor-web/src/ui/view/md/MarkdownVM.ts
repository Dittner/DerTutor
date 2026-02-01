import { RXObservableValue } from "flinker"

import { DerTutorContext } from "../../../DerTutorContext"
import { ViewModel } from "../ViewModel"
import { Interactor } from "../Interactor"
import { log } from "../../../app/Logger"
import { globalContext } from "../../../App"
import { QuickSearchController } from "../../controls/QuickSearch"

export interface MarkdownState { }

const TEXT_KEY = 'MDVM:TEXT__KEY'
const EDIT_MODE_KEY = 'MDVM:EDIT_MODE_KEY'

const DEF_TEXT = `Режим _Markdown_ позволяет читать текст, не отвлекаясь на поиск незнакомого иностранного слова. Вам не нужно постоянно переключаться между текстом и словарем в отдельной вкладке или приложении.

## Как этим пользоваться?
\`\`\`ol
1. Вставьте в редактор текст на немецком или английском языке;
1. Выключите режим редактирования: Edit Mode — off (ESC);
1. Выделите слово (e.g. Tipp) и нажимете слэш; слово добавится в поле быстрого поиска;
1. Приведите слово к нормальной форме (инфинитив для глаголов) и нажмите Enter;
1. Если слово есть в словаре, то будет показан его перевод;
1. При необходимости измените язык (de|en);
1. Чтобы включить режим редактирование нажмите: e;
1. Введённый текст сохраняется после перезагрузки страницы.
\`\`\``

export class MarkdownVM extends ViewModel<MarkdownState> {
  readonly $state = new RXObservableValue<Readonly<MarkdownState>>({})
  readonly $text = new RXObservableValue('')
  readonly $editMode = new RXObservableValue(true)

  readonly quiclSearchController: QuickSearchController

  constructor(ctx: DerTutorContext) {
    const interactor = new MarkdownInteractor(ctx)
    super('md', ctx, interactor)
    this.addKeybindings()

    this.quiclSearchController = new QuickSearchController(ctx, true)

    this.$text.value = globalContext.localStorage.read(TEXT_KEY) || DEF_TEXT
    this.$editMode.value = globalContext.localStorage.read(EDIT_MODE_KEY) ?? true

    this.$text.pipe()
      .skipFirst()
      .onReceive(value => {
        globalContext.localStorage.write(TEXT_KEY, value)
      })
      .subscribe()

    this.$editMode.pipe()
      .skipFirst()
      .onReceive(value => {
        globalContext.localStorage.write(EDIT_MODE_KEY, value)
      })
      .subscribe()
  }

  private addKeybindings() {
    this.addDefaultKeybindings()
    this.actionsList.add('/', 'Quick Search', () => this.quiclSearchController.focus())
    this.actionsList.add('<Space>', 'Play audio', () => this.quiclSearchController.playAudio())
    this.actionsList.add('e', 'Edit', () => this.$editMode.value = true)
    this.actionsList.add('q', 'Quit', () => this.quit())
  }

  override onKeyDown(e: KeyboardEvent) {
    if (!this.$editMode.value) super.onKeyDown(e)
  }

  quit() {
    this.navigator.navigateTo({})
  }
}

class MarkdownInteractor extends Interactor<MarkdownState> {
  constructor(ctx: DerTutorContext) {
    super(ctx)
    log('new MarkdownInteractor')
  }
}
