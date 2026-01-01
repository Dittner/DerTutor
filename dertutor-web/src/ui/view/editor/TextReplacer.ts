import { RXObservableValue } from "flinker"

export class TextReplacer {
  readonly $replaceFrom = new RXObservableValue('')
  readonly $replaceTo = new RXObservableValue('')

}