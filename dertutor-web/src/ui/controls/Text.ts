import { p } from "flinker-dom"
import { theme } from "../theme/ThemeManager"
import { FontFamily } from "./Font"
import { translate } from "../../app/LocaleManager"


export const Title = (value: string) => {
  return p()
    .react(s => {
      s.textColor = theme().text
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().fontSizeXS
      s.text = translate(value)
      s.fontWeight = 'bold'
    })
}

export const KeyboardKey = (value: string) => {
  return p()
    .react(s => {
      s.textColor = theme().text50
      s.text = value
      s.wrap = false
      s.whiteSpace = 'nowrap'
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.ARTICLE
      s.borderColor = theme().border + '88'
      s.bgColor = theme().border + '40'
      s.paddingHorizontal = '8px'
      s.cornerRadius = '4px'
    })
}