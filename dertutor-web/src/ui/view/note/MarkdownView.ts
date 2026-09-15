import { vstack } from "flinker-dom"
import { log } from "../../../app/Logger"
import { TextFormatter } from "../editor/TextFormatter"
import { layout } from "../../../app/Application"
import { theme } from "../../theme/ThemeManager"
import { Markdown } from "../../controls/Markdown"
import { TextEditor } from "../editor/TextEditor"
import { RXObservableValue } from "flinker"
import { FontFamily } from "../../controls/Font"
import { globalContext } from "../../../App"

export const MarkdownView = () => {
  log('new MarkdownView')
  const vm = globalContext.vmFactory.getNoteListVM()
  const formatter = new TextFormatter()

  return vstack()
    .children(() => {

      Editor(vm.$mdText, formatter)
        .observe(vm.$mdViewMode)
        .react(s => {
          s.visible = vm.$mdViewMode.value === 'editing'
          s.width = '100%'
          s.height = '100%'
          s.maxWidth = layout().contentWidth + 'px'
        })

      Markdown()
        .observe(vm.$mdText)
        .observe(vm.$mdViewMode)
        .react(s => {
          s.visible = vm.$mdViewMode.value === 'shown'
          s.className = theme().id
          s.mode = 'md'
          s.width = '100%'
          s.maxWidth = layout().contentWidth + 'px'
          //s.minHeight = window.innerHeight - layout().navBarHeight + 'px'
          s.fontFamily = FontFamily.ARTICLE
          s.fontSize = theme().fontSize
          s.textColor = theme().text
          s.bgColor = theme().articleBg
          s.text = vm.$mdText.value
          s.absolutePathPrefix = globalContext.server.baseUrl
          s.paddingTop = '20px'
          s.paddingHorizontal = layout().paddingHorizontal + 'px'
          s.borderColor = theme().border
          s.className = theme().id + ' listScrollbar'
          s.enableOwnScroller = true
        })
    })
}


const Editor = (buffer: RXObservableValue<string>, formatter: TextFormatter) => {
  const vm = globalContext.vmFactory.getNoteListVM()
  return TextEditor(formatter)
    .bind(buffer)
    .react(s => {
      s.width = '100%'
      s.bgColor = theme().appBg
      s.caretColor = theme().caretColor
      s.textColor = theme().red + 'aa'
      s.autoFocus = false
      s.paddingTop = '20px'
      s.paddingHorizontal = layout().paddingHorizontal + 'px'
      //s.padding = '10px'
      s.fontFamily = FontFamily.ARTICLE
      s.fontSize = theme().fontSize
      s.borderColor = theme().border
    })
    .whenFocused(s => {
      //s.textColor = theme().red + 'cc'
      s.borderColor = theme().red
    })
    .onKeyDown(e => {
      if (e.key === 'Escape') {
        e.preventDefault()
        vm.didPressESC()
      } else if (globalContext.app.getSelection() && e.key === '/') {
        e.preventDefault()
        vm.quickSearchController.focus()
      }
    })
}