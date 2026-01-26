import { hstack, p, spacer, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { AccentBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { log } from "../../../app/Logger"
import { translate } from "../../../app/LocaleManager"
import { ViewLayer } from "../../../app/ViewLayer"
import { TextFormatter } from "../editor/TextFormatter"
import { TextEditor } from "../editor/TextEditor"
import { RXObservableValue } from "flinker"
import { Markdown } from "../../controls/Markdown"
import { QuickSearchPanel } from "../../controls/QuickSearch"

export const LabView = () => {
  log('new LabView')

  const ctx = DerTutorContext.self
  const vm = ctx.labVM

  const formatter = new TextFormatter()

  return hstack()
    .observe(globalContext.app.$layout, 'affectsChildrenProps')
    .observe(vm.$editMode, 'affectsChildrenProps')
    .children(() => {

      Header()
        .react(s => {
          s.position = 'fixed'
          s.height = globalContext.app.$layout.value.navBarHeight + 'px'
          s.width = '100%'
          s.layer = ViewLayer.EDITOR
        })

      LabEditor('Editor1', vm.$editor1, formatter)
        .react(s => {
          s.visible = vm.$editMode.value
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.left = '20px'
          s.top = layout.navBarHeight + 'px'

          s.width = window.innerWidth / 2 - 20 + 'px'
          s.height = (window.innerHeight - layout.navBarHeight - layout.statusBarHeight) / 2 - 20 + 'px'
        })

      LabEditor('Editor2', vm.$editor2, formatter)
        .react(s => {
          s.visible = vm.$editMode.value
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.left = '20px'
          s.width = window.innerWidth / 2 - 20 + 'px'
          s.height = (window.innerHeight - layout.navBarHeight - layout.statusBarHeight) / 2 - 20 + 'px'
          s.top = (window.innerHeight - layout.navBarHeight - layout.statusBarHeight) / 2 + layout.navBarHeight + 'px'
        })

      vstack()
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.paddingLeft = vm.$editMode.value ? (window.innerWidth / 2 + 20 + 'px') : (layout.leftSideMenuWidth + 'px')
          s.width = '100%'
          s.paddingRight = '10px'
          s.paddingTop = globalContext.app.$layout.value.navBarHeight + 'px'
          s.gap = '20px'
        })
        .children(() => {

          LabEditor('Result', vm.$result, formatter)
            .react(s => {
              const layout = globalContext.app.$layout.value
              s.visible = vm.$editMode.value
              s.width = '100%'
              s.height = (window.innerHeight - layout.navBarHeight - layout.statusBarHeight) - 20 + 'px'
            })

          Markdown()
            .observe(vm.$result)
            .react(s => {
              s.visible = !vm.$editMode.value
              s.className = theme().id
              s.width = '100%'
              s.maxWidth = '900px'
              s.fontFamily = FontFamily.ARTICLE
              s.textColor = theme().text
              s.cornerRadius = '5px'
              s.text = vm.$result.value
              s.mode = 'md'
              s.fontSize = theme().fontSize
              s.absolutePathPrefix = globalContext.server.baseUrl
              s.paddingBottom = globalContext.app.$layout.value.statusBarHeight + 15 + 'px'
            })
        })

      QuickSearchPanel(vm.quiclSearchController)
        .react(s => {
          s.visible = !vm.$editMode.value
          s.position = 'fixed'
          s.width = '400px'
          s.top = globalContext.app.$layout.value.navBarHeight + 'px'
          s.right = '20px'
        })
    })
}

const Header = () => {
  const vm = DerTutorContext.self.labVM
  return hstack()
    .react(s => {
      s.gap = '20px'
      s.paddingHorizontal = '20px'
      s.halign = 'left'
      s.valign = 'center'
    })
    .children(() => {
      p().react(s => {
        s.text = 'Merge two texts sentence by sentence'
        s.textColor = theme().text
      })

      spacer()

      AccentBtn()
        .observe(vm.$editMode)
        .react(s => {
          s.isSelected = vm.$editMode.value
          s.text = 'Edit Mode: ' + (s.isSelected ? 'On' : 'Off')
        })
        .onClick(() => vm.$editMode.value = !vm.$editMode.value)

      AccentBtn()
        .react(s => {
          s.text = 'Merge'
        })
        .onClick(() => vm.merge())

      AccentBtn()
        .react(s => {
          s.text = translate('Quit')
          s.popUp = 'ESC'
        })
        .onClick(() => vm.quit())
    })
}

const LabEditor = (title: string, buffer: RXObservableValue<string>, formatter: TextFormatter) => {

  return vstack()
    .react(s => {
      s.gap = '5px'
    })
    .children(() => {
      p().react(s => {
        s.text = title
        s.textColor = theme().text50
        s.fontSize = theme().fontSizeXS
      })
      TextEditor(formatter)
        .bind(buffer)
        .react(s => {
          s.width = '100%'
          s.height = '100%'
          s.bgColor = theme().appBg
          s.caretColor = theme().red
          s.textColor = theme().editor
          s.padding = '10px'
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().fontSizeS
          s.border = '1px solid ' + theme().border
        })
        .whenFocused(s => {
          s.border = '1px solid #454545'
        })
    })
}

