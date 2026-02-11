import { p, spacer } from "flinker-dom"
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
      s.textColor = theme().text
      s.text = value
      s.wrap = false
      s.whiteSpace = 'nowrap'
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.ARTICLE
      s.borderColor = theme().text + '20'
      s.bgColor = theme().text + '10'
      s.paddingHorizontal = '8px'
      s.cornerRadius = '4px'
    })
}

export const VSeparator = () => {
  return spacer().react(s => {
    s.bgColor = theme().border
    s.width = '1px'
    s.height = '15px'
  })
}