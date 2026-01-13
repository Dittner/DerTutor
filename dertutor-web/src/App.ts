import { div, hstack, observer, p, spacer, span, vlist } from "flinker-dom"
import { GlobalContext } from "./app/GlobalContext"
import { Action } from "./ui/actions/Action"
import { FontFamily } from "./ui/controls/Font"
import { theme, themeManager } from "./ui/theme/ThemeManager"
import { ServerConnectionView } from "./ui/view/connect/ServerConnctionView"
import { EditorView } from "./ui/view/editor/EditorView"
import { NoteListView } from "./ui/view/note/NoteListView"
import { VocListView } from "./ui/view/vocs/VocListView"
import { DerTutorContext } from "./DerTutorContext"
import { LineInput } from "./ui/controls/Input"
import { Icon } from "./ui/controls/Button"
import { MaterialIcon } from "./ui/icons/MaterialIcon"

export const globalContext = GlobalContext.init()

export function App() {
  console.log('new App')
  const ctx = DerTutorContext.init()

  return div()
    .observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
    })
    .children(() => {
      Header()
      Footer()

      observer(ctx.$activeVM)
        .onReceive(vm => {
          if (vm === ctx.connectionVM) return ServerConnectionView()
          else if (vm === ctx.vocListVM) return VocListView()
          else if (vm === ctx.noteListVM) return NoteListView()
          else if (vm === ctx.editorVM) return EditorView()
          else return undefined
        })
      
      ActionsHelpView()
      AppErrorInfo()
      ModalView()
    })
}

export const ActionsHelpView = () => {
  const ctx = DerTutorContext.self

  return div()
    .observe(ctx.$activeVM.pipe().skipNullable().flatMap(vm => vm.$showActions).fork())
    .react(s => {
      const vm = ctx.$activeVM.value
      const layout = globalContext.app.$layout.value
      s.visible = vm && vm.$showActions.value
      s.position = 'fixed'
      s.right = '0px'
      s.width = '500px'
      s.paddingTop = layout.navBarHeight + 'px'
      s.paddingBottom = layout.statusBarHeight + 'px'
      s.height = window.innerHeight + 'px'
      s.paddingHorizontal = '20px'
      s.gap = '0px'
      s.bgColor = theme().actionsBg
      s.layer = '100'
    }).children(() => {

      vlist<Action>()
        .observe(ctx.$activeVM, 'recreateChildren')
        .items(() => ctx.$activeVM.value?.actionsList.actions ?? [])
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '100%'
          s.gap = '0'
        })
    })
}

const ActionInfoView = (a: Action) => {
  return p()
    .react(s => {
      s.width = '100%'
      s.height = '100%'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
    }).children(() => {
      span().react(s => {
        s.display = 'inline-block'
        s.text = a.cmd
        s.textColor = theme().strong
        s.paddingHorizontal = '20px'
        s.paddingVertical = '5px'
        s.width = '160px'
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = a.desc
          s.textColor = theme().text
          s.width = '100%'
          s.whiteSpace = 'nowrap'
          s.paddingVertical = '5px'
        })
    })
}

const Header = () => {
  const ctx = DerTutorContext.self

  return hstack()
    .react(s => {
      s.position = 'fixed'
      s.top = '0px'
      s.left = '0px'
      s.width = '100%'
      s.height = globalContext.app.$layout.value.navBarHeight + 'px'
      s.valign = 'center'
      s.paddingHorizontal = '20px'
      s.layer = '10'
      s.bgColor = theme().appBg + 'cc'
      s.borderBottom = '1px solid ' + theme().border
      s.blur = '10px'
    })
    .children(() => {
      p()
        .observe(ctx.$user)
        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().fontSizeXS
          s.textColor = '#604d92'
          if (!ctx.$user.value)
            s.text = ''
          else
            s.text = ctx.$user.value.username + (ctx.$user.value.is_superuser ? ':superuser' : '')
        })

      spacer()

      hstack()
        .observe(themeManager.$theme, 'affectsChildrenProps')
        .react(s => {
          s.width = '60px'
          s.height = '30px'
          s.cornerRadius = '30px'
          s.paddingHorizontal = '5px'
          s.valign = 'center'
          s.gap = '0px'
          s.border = '1px solid ' + theme().border
          s.textColor = theme().text + '88'
          s.popUp = 'Toggle theme (T)'
        })
        .children(() => {
          Icon().react(s => {
            s.value = MaterialIcon.sunny
            s.fontSize = theme().fontSizeS
            s.width = '30px'
            s.textAlign = 'center'
            s.textColor = theme().isLight ? theme().text : 'inherit'
          })

          spacer()

          Icon().react(s => {
            s.value = MaterialIcon.brightness_3
            s.fontSize = theme().fontSizeS
            s.width = '30px'
            s.textAlign = 'center'
            s.textColor = !theme().isLight ? theme().text : 'inherit'
          })
        })
        .whenHovered(s => {
          s.textColor = theme().text
          s.bgColor = theme().text + '20'
          s.cursor = 'pointer'
        })
        .onClick(() => {
          themeManager.toggleTheme()
        })
    })
}

const Footer = () => {
  const ctx = DerTutorContext.self

  return hstack()
    .react(s => {
      s.position = 'fixed'
      s.bottom = '0'
      s.left = '0'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.gap = '10px'
      s.width = '100%'
      s.minHeight = globalContext.app.$layout.value.statusBarHeight + 'px'
      s.valign = 'center'
      //s.bgColor = theme().text + '10'
      //s.blur = '5px'
    })
    .children(() => {

      MessangerView()
      CmdView()

      observer(ctx.$activeVM).onReceive(vm => {
        return vm && LineInput(vm.inputMode.bufferController.$buffer, vm.inputMode.bufferController.$cursorPos)
          .observe(vm.inputMode.$isActive)
          .react(s => {
            s.visible = vm.inputMode.$isActive.value
            s.position = 'fixed'
            s.width = '100%'
            s.height = globalContext.app.$layout.value.statusBarHeight + 'px'
            s.bottom = '0'
            s.title = vm.inputMode.name
            s.isSecure = vm.inputMode.isSecure
          })
      })
    })
}

export const MessangerView = () => {
  const ctx = DerTutorContext.self
  return p()
    .observe(globalContext.app.$layout)
    .observe(ctx.$msg)
    .react(s => {
      const layout = globalContext.app.$layout.value
      const msg = ctx.$msg.value
      s.visible = !layout.isMobile
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.paddingHorizontal = '20px'
      s.text = msg?.text ?? ''
      //s.bgColor = theme().appBg
      s.width = layout.leftSideMenuWidth + 'px'

      if (msg?.level === 'error')
        s.textColor = theme().red
      else if (msg?.level === 'warning')
        s.textColor = theme().warn
      else
        s.textColor = theme().text50
    })
}

export const CmdView = () => {
  const ctx = DerTutorContext.self
  return p()
    .observe(ctx.$activeVM.pipe().skipNullable().flatMap(vm => vm.$cmd).fork())
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.text = ctx.$activeVM.value?.$cmd.value ?? ''
      s.whiteSpace = 'nowrap'
      s.textColor = theme().text50
      s.paddingHorizontal = '10px'
      s.width = '100%'
      s.textAlign = 'right'
    })
}

const AppErrorInfo = () => {
  return div()
    .observe(globalContext.app.$err, 'affectsProps', 'affectsChildrenProps')
    .react(s => {
      s.visible = globalContext.app.$err.value.length > 0
      s.position = 'fixed'
      s.top = '0'
      s.width = '100%'
    }).children(() => {
      p().react(s => {
        s.whiteSpace = 'nowrap'
        s.paddingHorizontal = '10px'
        s.textColor = theme().red
        s.borderTop = '2px solid ' + theme().red
        s.fontFamily = FontFamily.MONO
        s.fontSize = '10px'
        s.text = globalContext.app.$err.value
        s.width = '100%'
        s.textAlign = 'center'
      })
    })
}

const ModalView = () => {
  return div()
    .observe(globalContext.app.$dropdownState)
    .react(s => {
      s.visible = globalContext.app.$dropdownState.value.length > 0
      s.position = 'fixed'
      s.top = '0'
      s.width = '100vw'
      s.height = '100vh'
      s.bgColor = theme().appBg + '50'
    }).children(() => {

    })
    .onClick(() => globalContext.app.$dropdownState.value = '')
}