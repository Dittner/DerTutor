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
import { ViewLayer } from "./app/ViewLayer"
import { LabView } from "./ui/view/lab/LabView"
import { MarkdownView } from "./ui/view/md/MarkdownView"
import { layout } from "./app/Application"

export const globalContext = GlobalContext.init()

export function App() {
  log('new App')
  const ctx = DerTutorContext.init()

  return div()
    .observe(themeManager.$theme, 'affectsProps', 'affectsChildrenProps')
    .observe(localeManager.$locale, 'affectsProps', 'affectsChildrenProps')
    .observe(globalContext.app.$layout, 'affectsProps', 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
    })
    .children(() => {
      observer(ctx.$activeVM)
        .onReceive(vm => {
          if (!vm) return undefined
          if (vm.id === 'connection') return ServerConnectionView()
          else if (vm.id === 'vocs') return VocListView()
          else if (vm.id === 'notes') return NoteListView()
          else if (vm.id === 'editor') return EditorView()
          else if (vm.id === 'lab') return LabView()
          else if (vm.id === 'md') return MarkdownView()
          else return undefined
        })

      MessangerView()
      CmdView()
      LineInputFooter()
      //ModalView()
      ActionsHelpView()
      AppErrorInfo()
      LayoutLinesForDevMode()
    })
    .onClick(() => globalContext.app.$dropdownState.value = '')
}


const SHORTKEY_TEXT_WIDTH = '160px'
export const ActionsHelpView = () => {
  const ctx = DerTutorContext.self

  return div()
    .observe(ctx.$activeVM.pipe().skipNullable().flatMap(vm => vm.$showActions).fork())
    .react(s => {
      const vm = ctx.$activeVM.value
      s.visible = vm && vm.$showActions.value
      s.position = 'fixed'
      s.top = layout().navBarHeight + 'px'
      s.cornerRadius = '10px'
      s.right = '20px'
      s.width = '600px'
      s.height = window.innerHeight - layout().navBarHeight - layout().statusBarHeight + 'px'
      s.paddingHorizontal = '20px'
      s.bgColor = theme().actionsBg
      s.blur = '10px'
      s.layer = ViewLayer.MODAL_VIEW
    }).children(() => {

      p().react(s => {
        s.textColor = theme().green
        s.fontWeight = 'bold'
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.paddingTop = '20px'
        s.fontSize = theme().fontSizeM
        s.text = translate('Shortkeys')
      })

      p().react(s => {
        s.textColor = theme().green
        s.paddingLeft = SHORTKEY_TEXT_WIDTH
        s.text = translate('(Press ESC to hide)')
        s.paddingBottom = '20px'
      })

      vlist<Action>()
        .observe(ctx.$activeVM, 'recreateChildren')
        .observe(ctx.$user, 'recreateChildren')
        .items(() => ctx.$activeVM.value?.actionsList.actions.filter(a => !a.onlySuperUser || (ctx.$user.value?.is_superuser && ctx.$user.value?.is_active)) ?? [])
        .itemHash(a => a.cmd)
        .itemRenderer(ActionInfoView)
        .react(s => {
          s.width = '100%'
          s.gap = '0'
        })

        spacer().react(s => {
          s.bgColor = theme().green + '44'
          s.width = '200px'
          s.height = '5px'
          s.marginLeft = SHORTKEY_TEXT_WIDTH
          s.marginVertical = '20px'
        })

      vstack()
        .react(s => {
          s.width = 'unset'
          s.textColor = theme().green + 'aa'
          s.fontSize = theme().fontSizeXS
          s.fontFamily = FontFamily.MONO
          s.paddingLeft = SHORTKEY_TEXT_WIDTH
          //s.paddingTop = '50px'
          s.paddingRight = '20px'
        })
        .children(() => {
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
        s.textColor = theme().green100
        
        s.paddingHorizontal = '20px'
        s.width = SHORTKEY_TEXT_WIDTH
        s.whiteSpace = 'nowrap'
        s.textAlign = 'right'
        s.fontWeight = 'bold'
      })

      span()
        .react(s => {
          s.text = translate(a.desc)
          s.textColor = theme().green
          s.width = '100%'
          //s.whiteSpace = 'nowrap'
          s.paddingVertical = '2px'
        })
    })
}

export const ThemeSwitcher = () => {
  return hstack()
    .observe(themeManager.$theme, 'affectsChildrenProps')
    .react(s => {
      s.height = '25px'
      s.cornerRadius = '35px'
      s.paddingHorizontal = '10px'
      s.valign = 'center'
      s.gap = '2px'
      s.border = '1px solid ' + theme().border
      s.textColor = theme().text + '50'
      s.popUp = theme().id
    })
    .whenHovered(s => {
      s.bgColor = theme().text + '20'
      s.cursor = 'pointer'
    })
    .onClick(() => {
      themeManager.toggleTheme()
    })
    .children(() => {
      // Icon().react(s => {
      //   s.value = MaterialIcon.sunny
      //   s.fontSize = theme().fontSizeXS
      //   s.textAlign = 'center'
      //   s.textColor = theme().id === 'light' ? theme().text : 'inherit'
      // })

      // spacer()

      Icon().react(s => {
        s.value = MaterialIcon.contrast
        s.fontSize = theme().fontSizeXS
        s.textAlign = 'center'
        s.textColor = theme().id === 'dark' ? theme().text : 'inherit'
      })

      spacer()

      Icon().react(s => {
        s.value = MaterialIcon.brightness_3
        s.fontSize = theme().fontSizeXS
        s.textAlign = 'center'
        s.textColor = theme().id === 'night' ? theme().text : 'inherit'
      })
    })

}

const LineInputFooter = () => {
  const ctx = DerTutorContext.self

  return observer(ctx.$activeVM).onReceive(vm => {
    return vm && LineInput(vm.inputMode.bufferController.$buffer, vm.inputMode.bufferController.$cursorPos)
      .observe(vm.inputMode.$isActive)
      .react(s => {
        s.visible = vm.inputMode.$isActive.value
        s.position = 'fixed'
        s.bottom = '0'
        s.left = '0'
        s.fontFamily = FontFamily.MONO
        s.fontSize = theme().fontSizeXS
        s.width = '100%'
        s.height = layout().statusBarHeight + 'px'
        s.minHeight = layout().statusBarHeight + 'px'
        s.valign = 'center'
        s.layer = ViewLayer.FOOTER
        s.bottom = '0'
        s.title = vm.inputMode.name
        s.isSecure = vm.inputMode.isSecure
      })
  })
}

export const MessangerView = () => {
  const ctx = DerTutorContext.self
  return p()
    .observe(ctx.$msg)
    .react(s => {
      const msg = ctx.$msg.value
      s.position = 'fixed'
      s.height = layout().statusBarHeight + 'px'
      s.lineHeight = layout().statusBarHeight + 'px'
      s.bottom = '0'
      s.left = '0'
      s.layer = ViewLayer.FOOTER
      s.visible = !layout().isMobile
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.paddingHorizontal = '20px'
      s.text = msg?.text ?? ''
      //s.width = 'unset'
      s.wrap = false
      s.whiteSpace = 'nowrap'
      s.bgColor = layout().isCompact ? theme().appBg + '88' : theme().menuBg

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
      s.position = 'fixed'
      s.height = layout().statusBarHeight + 'px'
      s.lineHeight = layout().statusBarHeight + 'px'
      s.bottom = '0'
      s.right = '0'
      s.layer = ViewLayer.FOOTER

      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.text = ctx.$activeVM.value?.$cmd.value ?? ''
      s.whiteSpace = 'nowrap'
      s.textColor = theme().text50
      s.paddingHorizontal = '20px'
      s.bgColor = layout().isCompact ? theme().appBg + '88' : theme().appBg
    })
}

const AppErrorInfo = () => {
  return div()
    .observe(globalContext.app.$err, 'affectsProps', 'affectsChildrenProps')
    .react(s => {
      s.visible = globalContext.app.$err.value.length > 0
      s.position = 'fixed'
      s.top = '0'
      s.left = '0'
      s.width = 'unset'
    }).children(() => {
      p().react(s => {
        s.whiteSpace = 'nowrap'
        s.paddingHorizontal = '10px'
        s.textColor = theme().red
        s.borderTop = '2px solid ' + theme().red
        s.fontFamily = FontFamily.MONO
        s.fontSize = '10px'
        s.text = globalContext.app.$err.value
        s.textAlign = 'center'
        s.bgColor = theme().red + '10'
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
      s.bgColor = theme().red + '50'
      s.layer = ViewLayer.MODAL_VIEW
    })
    .onClick(() => globalContext.app.$dropdownState.value = '')
}

const LayoutLinesForDevMode = () => {
  const vline = () => {
    return spacer()
      .react(s => {
        s.position = 'fixed'
        s.width = '1px'
        s.height = '100%'
        s.bgColor = '#008800'
      })
  }

  const hline = () => {
    return spacer()
      .react(s => {
        s.position = 'fixed'
        s.width = '100%'
        s.height = '1px'
        s.bgColor = '#008800'
      })
  }

  return div()
    .observe(globalContext.app.$layoutLinesShown)
    .react(s => {
      s.visible = globalContext.app.$layoutLinesShown.value
      s.position = 'fixed'
      s.layer = '1000'
      s.top = '0'
      s.left = '0'
      s.width = '100%'
      s.height = '100%'
      s.bgColor = '#00880010'
    })
    .children(() => {
      vline().react(s => s.left = '0px')
      vline().react(s => s.right = '0px')
      vline().react(s => s.left = '20px')
      vline().react(s => s.left = layout().leftSideMenuWidth + 'px')
      vline().react(s => s.left = layout().leftSideMenuWidth - 20 + 'px')
      vline().react(s => s.left = layout().leftSideMenuWidth + layout().paddingHorizontal + 'px')
      vline().react(s => s.left = layout().leftSideMenuWidth + layout().contentWidth - layout().paddingHorizontal + 'px')
      vline().react(s => s.left = layout().leftSideMenuWidth + layout().contentWidth / 2 + 'px')
      vline().react(s => s.left = layout().leftSideMenuWidth + layout().contentWidth + 'px')
      vline().react(s => s.right = '20px')
      hline().react(s => s.top = layout().navBarHeight + 'px')
      hline().react(s => s.top = 2 * layout().navBarHeight + 'px')
      hline().react(s => s.bottom = layout().statusBarHeight + 'px')
    })
}

