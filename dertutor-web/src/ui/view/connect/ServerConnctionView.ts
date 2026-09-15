import { p, vstack } from "flinker-dom"
import { MessangerView } from "../../../App"
import { FontFamily } from "../../controls/Font"
import { theme } from "../../theme/ThemeManager"
import { layout } from "../../../app/Application"
import { GlobalContext } from "../../../app/GlobalContext"

export const ServerConnectionView = () => {
  const ctx = GlobalContext.self
  const vm = ctx.vmFactory.getConnectionVM()

  return vstack()
    .react(s => {
      s.position = 'fixed'
      s.width = '100vw'
      s.height = '100vh'
      s.paddingTop = layout().navBarHeight  + 'px'
      s.mouseEnabled = false
    }).children(() => {
      p()
        .observe(vm.$logs)

        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.text = vm.$logs.value
          s.textColor = theme().accent
          s.fontSize = '16px'
          s.paddingHorizontal = '20px'
          s.whiteSpace = 'pre'
          s.height = '100%'
        })

      MessangerView()
    })
}