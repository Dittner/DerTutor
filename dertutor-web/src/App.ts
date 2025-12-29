import { div, hstack, observer, p, span, vlist } from "flinker-dom"
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

      observer(ctx.$activeVM)
        .onReceive(vm => {
          if (vm === ctx.connectionVM) return ServerConnectionView()
          else if (vm === ctx.vocListVM) return VocListView()
          else if (vm === ctx.noteListVM) return NoteListView()
          else if (vm === ctx.editorVM) return EditorView()
          else return undefined
        })

      NavBar()
      ActionsHelpView()
      Footer()
      AppErrorInfo()
    })
}

export const ActionsHelpView = () => {
  const ctx = DerTutorContext.self

  return div()
    .observe(ctx.$activeVM.pipe().skipNullable().flatMap(vm => vm.$showActions).fork())
    .observe(ctx.$activeVM, 'recreateChildren')
    .react(s => {
      const vm = ctx.$activeVM.value
      s.visible = vm && vm.$showActions.value
      s.position = 'fixed'
      s.paddingTop = theme().navBarHeight + 'px'
      s.left = window.innerWidth / 2 + 'px'
      s.width = window.innerWidth / 2 + 'px'
      s.top = '0'
      s.height = window.innerHeight + 'px'
      s.paddingHorizontal = '20px'
      s.gap = '0px'
      s.bgColor = theme().actionsBg
    }).children(() => {
      const vm = ctx.$activeVM.value
      vlist<Action>()
        .items(() => vm?.actionsList.actions ?? [])
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
      s.fontSize = theme().defMenuFontSize
    }).children(() => {
      span().react(s => {
        s.display = 'inline-block'
        s.text = a.cmd
        s.textColor = theme().strong
        s.paddingHorizontal = '20px'
        s.paddingVertical = '5px'
        s.width = '200px'
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

const NavBar = () => {
  const ctx = DerTutorContext.self

  return hstack()
    .react(s => {
      s.position = 'fixed'
      s.top = '0'
      s.left = '0'
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.gap = '10px'
      //s.width = '100%'
      s.minHeight = theme().navBarHeight + 'px'
      s.valign = 'center'
      s.paddingHorizontal = '20px'
    })
    .children(() => {

      p()
        .observe(ctx.$user)
        .react(s => {
          s.textColor = theme().text50
          if (!ctx.$user.value)
            s.text = ''
          else
            s.text = ctx.$user.value.username + (ctx.$user.value.is_superuser ? ':superuser' : '')
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
      s.fontSize = theme().defMenuFontSize
      s.gap = '10px'
      s.width = '100%'
      s.minHeight = theme().statusBarHeight + 'px'
      s.valign = 'center'
      s.bgColor = theme().text + '10'
      //s.blur = '5px'
    })
    .children(() => {

      MessangerView().react(s => {
        s.width = '100%'
      })

      CmdView()

      observer(ctx.$activeVM).onReceive(vm => {
        return vm && LineInput(vm.inputMode.bufferController.$buffer, vm.inputMode.bufferController.$cursorPos)
          .observe(vm.inputMode.$isActive)
          .react(s => {
            s.visible = vm.inputMode.$isActive.value
            s.position = 'fixed'
            s.width = '100%'
            s.height = theme().statusBarHeight + 'px'
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
    .observe(ctx.$msg)
    .react(s => {
      const msg = ctx.$msg.value
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().defMenuFontSize
      s.text = msg?.text ?? ''
      //s.bgColor = theme().appBg
      s.width = '100%'
      s.paddingHorizontal = '20px'

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
      s.fontSize = theme().defMenuFontSize
      s.text = ctx.$activeVM.value?.$cmd.value ?? ''
      s.whiteSpace = 'nowrap'
      s.paddingHorizontal = '10px'
      s.textColor = theme().text50
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