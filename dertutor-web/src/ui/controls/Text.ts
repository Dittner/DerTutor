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