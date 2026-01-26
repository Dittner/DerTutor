import { RXObservableValue } from "flinker"

import { DerTutorContext } from "../../../DerTutorContext"
import { ViewModel } from "../ViewModel"
import { Interactor } from "../Interactor"
import { log } from "../../../app/Logger"
import { globalContext } from "../../../App"
import { QuickSearchController } from "../../controls/QuickSearch"

export interface LabState { }

const EDITOR1_TEXT_KEY = 'LABVM:EDITOR1_TEXT_KEY'
const EDITOR2_TEXT_KEY = 'LABVM:EDITOR2_TEXT_KEY'
const RESULT_KEY = 'LABVM:RESULT_TEXT__KEY'
const EDIT_MODE_KEY = 'LABVM:EDIT_MODE_KEY'

export class LabVM extends ViewModel<LabState> {
  readonly $state = new RXObservableValue<Readonly<LabState>>({})
  readonly $editor1 = new RXObservableValue('')
  readonly $editor2 = new RXObservableValue('')
  readonly $result = new RXObservableValue('')
  readonly $editMode = new RXObservableValue(true)

  readonly quiclSearchController: QuickSearchController

  constructor(ctx: DerTutorContext) {
    const interactor = new LabInteractor(ctx)
    super('lab', ctx, interactor)
    this.addKeybindings()

    this.quiclSearchController = new QuickSearchController(ctx, true)

    this.$editor1.value = globalContext.localStorage.read(EDITOR1_TEXT_KEY) ?? ''
    this.$editor2.value = globalContext.localStorage.read(EDITOR2_TEXT_KEY) ?? ''
    this.$result.value = globalContext.localStorage.read(RESULT_KEY) ?? ''
    this.$editMode.value = globalContext.localStorage.read(EDIT_MODE_KEY) ?? true

    this.$editor1.pipe()
      .skipFirst()
      .onReceive(value => {
        globalContext.localStorage.write(EDITOR1_TEXT_KEY, value)
      })
      .subscribe()

    this.$editor2.pipe()
      .skipFirst()
      .onReceive(value => {
        globalContext.localStorage.write(EDITOR2_TEXT_KEY, value)
      })
      .subscribe()

    this.$result.pipe()
      .skipFirst()
      .onReceive(value => {
        globalContext.localStorage.write(RESULT_KEY, value)
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
  }

  override onKeyDown(e: KeyboardEvent) {
    if (!this.$editMode.value) super.onKeyDown(e)
  }

  quit() {
    this.navigator.navigateTo({})
  }

  merge() {
    const text1Rows = this.$editor1.value.replace(/([.?!]+)/gm, '$1\n').replace(/\n+/gm, '\n').split('\n')
    const text2Rows = this.$editor2.value.replace(/([.?!]+)/gm, '$1\n').replace(/\n+/gm, '\n').split('\n')
    let res = '```ol\n'
    text1Rows.forEach((r, i) => {
      if (!r.match(/^\s*$/)) {
        res += '1. ' + r + '\n'
        if (i < text2Rows.length)
          res += '~ ' + text2Rows.at(i) + '\n\n'
      }

    })
    res += '```'
    this.$result.value = res
  }
}

class LabInteractor extends Interactor<LabState> {
  constructor(ctx: DerTutorContext) {
    super(ctx)
    log('new LabInteractor')
  }
}
