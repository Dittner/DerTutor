import { RXObservableValue } from "flinker";
import { logWarn } from "./Logger";
import de_locale_text from "../resources/de_locale.txt?raw";

export type Locale = 'de' | 'en'

export class LocaleManager {
  readonly $locale = new RXObservableValue<Locale>('en')
  readonly enDeTanslator: LocaleTranslator

  constructor() {
    this.enDeTanslator = new LocaleTranslator(de_locale_text)
  }

  translate(value: string): string {
    if (this.$locale.value === 'en') return value
    return this.enDeTanslator.translate(value)
  }
}

class LocaleTranslator {
  readonly keyValueDict: Record<string, string>
  readonly matchers: Array<[RegExp, string]>

  constructor(file: string) {
    this.keyValueDict = {}
    this.matchers = []

    const rows = file.split('\n')
    rows.forEach(row => {
      if (row) {
        const kw = row.split(/ *= */)
        if (kw.length > 1) {
          const key = kw[0]
          const value = kw[1]
          if (key.includes('%')) {
            const matcheKey = '^' + key.replaceAll('%d%', '(\\d+)').replaceAll('%s%', '(\\w+)') + '$'
            this.matchers.push([new RegExp(matcheKey), value])
          } else {
            this.keyValueDict[key] = value
          }
        } else {
          logWarn('LocaleTranslator: invalid key-value:', row)
        }
      }
    })
  }

  translate(value: string): string {
    const res = this.keyValueDict[value]

    if (res) return res
    for (const [replaceFrom, replaceTo] of this.matchers) {
      if (value.match(replaceFrom)) {
        const res = value.replace(replaceFrom, replaceTo)
        this.keyValueDict[value] = res
        return res
      }
    }

    return value
  }
}

export const localeManager = new LocaleManager()
export const translate = (value: string): string => {
  return localeManager.translate(value)
}