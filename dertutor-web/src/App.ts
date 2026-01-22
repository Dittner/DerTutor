import { div, hstack, observer, p, spacer, span, vlist, vstack } from "flinker-dom"
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
import { log } from "./app/Logger"
import { localeManager, translate } from "./app/LocaleManager"

export const globalContext = GlobalContext.init()

export function App() {
  log('new App')
  const ctx = DerTutorContext.init()

  return div()
    .observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
    .observe(localeManager.$locale, 'affectsProps', 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
    })
    .children(() => {
      observer(ctx.$activeVM)
        .onReceive(vm => {
          if (vm === ctx.connectionVM) return ServerConnectionView()
          else if (vm === ctx.vocListVM) return VocListView()
          else if (vm === ctx.noteListVM) return NoteListView()
          else if (vm === ctx.editorVM) return EditorView()
          else return undefined
        })

      UserAuthStatus()
      Footer()
      ActionsHelpView()
      AppErrorInfo()
      ModalView()
    })
}


const SHORTKEY_TEXT_WIDTH = '160px'
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
      s.width = '600px'
      s.paddingTop = '20px'
      s.paddingBottom = layout.statusBarHeight + 'px'
      s.height = window.innerHeight + 'px'
      s.paddingHorizontal = '20px'
      s.gap = '0px'
      s.bgColor = theme().actionsBg
      s.layer = '100'
    }).children(() => {

      p().react(s => {
        s.textColor = theme().text
        s.fontWeight = 'bold'
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.text = translate('Shortkeys')
      })

      p().react(s => {
        s.textColor = theme().text
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.text = translate('(Press ESC to hide)')
        s.paddingBottom = '20px'
      })


      vlist<Action>()
        .observe(ctx.$activeVM, 'recreateChildren')
        .items(() => ctx.$activeVM.value?.actionsList.actions ?? [])
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '100%'
          s.gap = '0'
        })

      vstack()
        .react(s => {
          s.width = 'unset'
          s.textColor = theme().strong
          s.fontSize = theme().fontSizeXS
          s.fontFamily = FontFamily.MONO
          s.paddingLeft = SHORTKEY_TEXT_WIDTH
          s.paddingTop = '20px'
          s.paddingRight = '20px'
          s.gap = '2px'
        })
        .children(() => {
          spacer().react(s => {
            s.width = '75%'
            s.height = '2px'
            s.bgColor = theme().text
            s.marginBottom = '20px'
          })
          p().react(s => { s.text = '<CR> — Enter' })
          p().react(s => s.text = '<C-k> — Ctrl+k / Cmd+k')
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
        s.paddingVertical = '2px'
        s.width = SHORTKEY_TEXT_WIDTH
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
      })

      span()
        .react(s => {
          s.text = translate(a.desc)
          s.textColor = theme().text
          s.width = '100%'
          //s.whiteSpace = 'nowrap'
          s.paddingVertical = '5px'
        })
    })
}

const UserAuthStatus = () => {
  const ctx = DerTutorContext.self

  return p()
    .observe(globalContext.app.$layout)
    .observe(ctx.$user)
    .react(s => {
      const layout = globalContext.app.$layout.value
      s.position = 'fixed'
      s.top = '0px'
      s.right = '120px'
      s.height = layout.navBarHeight + 'px'
      s.lineHeight = layout.navBarHeight + 'px'
      s.visible = !layout.isCompact
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.textColor = '#604d92'
      s.layer = '100'
      if (!ctx.$user.value)
        s.text = ''
      else
        s.text = ctx.$user.value.username + (ctx.$user.value.is_superuser ? ':superuser' : '')
    })
}

export const ThemeSwitcher = () => {
  return hstack()
    .observe(themeManager.$theme, 'affectsChildrenProps')
    .react(s => {
      s.height = '40px'
      s.cornerRadius = '40px'
      s.paddingHorizontal = '10px'
      s.valign = 'center'
      s.gap = '0px'
      s.border = '1px solid ' + theme().border
      s.textColor = theme().text + '50'
    })
    .whenHovered(s => {
      s.bgColor = theme().text + '20'
      s.border = '1px solid ' + theme().border
      s.cursor = 'pointer'
    })
    .onClick(() => {
      themeManager.toggleTheme()
    })
    .children(() => {
      Icon().react(s => {
        s.value = MaterialIcon.sunny
        //s.fontSize = theme().fontSizeS
        s.textAlign = 'center'
        s.textColor = theme().isLight ? theme().text : 'inherit'
      })

      spacer()

      Icon().react(s => {
        s.value = MaterialIcon.brightness_3
        //s.fontSize = theme().fontSizeS
        s.textAlign = 'center'
        s.textColor = !theme().isLight ? theme().text : 'inherit'
      })
    })

}

const Footer = () => {
  const ctx = DerTutorContext.self

  return hstack()
    .observe(globalContext.app.$layout)
    .react(s => {
      const layout = globalContext.app.$layout.value
      s.position = 'fixed'
      s.bottom = '0'
      s.left = '0'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.gap = '10px'
      s.width = '100%'
      s.minHeight = globalContext.app.$layout.value.statusBarHeight + 'px'
      s.valign = 'center'
      //s.blur = '10px'
      s.layer = '100'
      s.bgColor = layout.isCompact ? theme().appBg + '88' : theme().transparent
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
      s.paddingHorizontal = '40px'
      s.text = msg?.text ?? ''
      s.width = '100%'
      s.wrap = false
      s.whiteSpace = 'nowrap'

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
    })
    .onClick(() => globalContext.app.$dropdownState.value = '')
}