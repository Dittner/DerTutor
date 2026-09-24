import { p, vstack } from "flinker-dom"
import { MessangerView } from "../../../App"
import { FontFamily } from "../../controls/Font"
import { theme } from "../../theme/ThemeManager"
import { GlobalContext } from "../../../app/GlobalContext"

export const ServerConnectionView = () => {
  const ctx = GlobalContext.self
  const vm = ctx.vmFactory.getConnectionVM()

  return vstack()
    .react(s => {
      s.position = 'fixed'
      s.width = '100vw'
      s.height = '100vh'
      s.valign = 'top'
      s.paddingVertical = '20px'
      s.mouseEnabled = false
    }).children(() => {
      p()
        .observe(vm.$logs)

        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.text = vm.$logs.value
          s.textColor = theme().text50
          s.fontSize = '16px'
          s.paddingHorizontal = '20px'
          s.whiteSpace = 'pre'
          s.height = '100%'
        })

      MessangerView()
    })
}