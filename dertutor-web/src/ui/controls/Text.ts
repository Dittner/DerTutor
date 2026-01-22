import { p, TextProps } from "flinker-dom"
import { theme } from "../theme/ThemeManager"
import { FontFamily } from "./Font"
import { globalContext } from "../../App"

export interface LocalizedTextProps extends TextProps {
  localizedText?: string
}


export const Text = () => {
  return p<LocalizedTextProps>()
    .map(s => {
      s.text = s.localizedText ? globalContext.localeManager.translate(s.localizedText) : s.text
    })
}

export const Title = (value: string) => {
  return Text()
    .react(s => {
      s.textColor = theme().text
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().fontSizeXS
      s.localizedText = value
      s.fontWeight = 'bold'
    })
}