import { hstack, p, spacer, vstack } from "flinker-dom"
import { globalContext, ThemeSwitcher } from "../../../App"
import { Btn, IconBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { log } from "../../../app/Logger"
import { ViewLayer } from "../../../app/ViewLayer"
import { TextFormatter } from "../editor/TextFormatter"
import { TextEditor } from "../editor/TextEditor"
import { RXObservableValue } from "flinker"
import { Markdown } from "../../controls/Markdown"
import { QuickSearchPanel } from "../../controls/QuickSearch"
import { translate } from "../../../app/LocaleManager"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { ARTICLE_WIDTH, layout, MARKDOWN_MAX_WIDTH } from "../../../app/Application"

export const MarkdownView = () => {
  log('new MarkdownView')
  const vm = DerTutorContext.self.vmFactory.getMarkdownVM()

  const formatter = new TextFormatter()

  return vstack()
    .observe(vm.$editMode, 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
      s.halign = 'center'
      s.paddingTop = layout().navBarHeight + 'px'

      s.halign = 'left'
      s.paddingLeft = layout().leftSideMenuWidth + 'px'
      s.gap = '0px'
      s.bg = theme().appBg
    })
    .children(() => {
      Header()
        .react(s => {
          s.position = 'fixed'
          s.height = layout().navBarHeight + 'px'
          s.width = '100%'
          s.left = '0'
          s.top = '0'
          s.layer = ViewLayer.HEADER
          //s.borderBottom = '1px solid ' + theme().border
        })

      Editor('Editor', vm.$text, formatter)
        .react(s => {
          s.visible = vm.$editMode.value
          s.width = '100%'
          s.maxWidth = layout().contentWidth - 2 * layout().paddingHorizontal + 'px'
          s.marginLeft = layout().paddingHorizontal + 'px'
          s.height = (window.innerHeight - layout().navBarHeight - layout().statusBarHeight) - 20 + 'px'
        })

      Markdown()
        .observe(vm.$text)
        .react(s => {
          s.visible = !vm.$editMode.value
          s.className = theme().markdownTheme.id
          s.mode = 'md'
          s.width = '100%'
          s.maxWidth = layout().contentWidth + 'px'
          s.minHeight = window.innerHeight - layout().navBarHeight + 'px'
          s.fontFamily = FontFamily.ARTICLE
          s.fontSize = theme().markdownTheme.fontSize
          s.textColor = theme().markdownTheme.text
          s.bgColor = theme().markdownTheme.articleBg
          s.text = vm.$text.value
          s.absolutePathPrefix = globalContext.server.baseUrl
          s.paddingTop = '20px'
          s.paddingLeft = layout().paddingHorizontal + 'px'
          s.paddingRight = ARTICLE_WIDTH - MARKDOWN_MAX_WIDTH - layout().paddingHorizontal + 'px'
          s.paddingBottom = layout().statusBarHeight + 15 + 'px'
        })

      QuickSearchPanel(vm.quiclSearchController)
        .observe(vm.quiclSearchController.$quickSearchFocused)
        .observe(vm.quiclSearchController.$quickSearchResult)
        .react(s => {
          const l = layout()
          if (l.isCompact)
            s.visible = vm.quiclSearchController.$quickSearchResult.value !== undefined || vm.quiclSearchController.$quickSearchFocused.value
          else
            s.visible = true
          s.position = 'fixed'
          s.left = l.isCompact ? '0px' : (l.contentWidth + l.leftSideMenuWidth + 20 + 'px')
          s.width = (l.isCompact ? l.contentWidth : window.innerWidth - l.contentWidth - l.leftSideMenuWidth - 40) + 'px'
          s.maxHeight = vm.quiclSearchController.$quickSearchResult.value ? window.innerHeight - l.navBarHeight - l.statusBarHeight - 40 + 'px' : 'unset'
          s.enableOwnScroller = true
          s.maxWidth = l.isCompact ? 'unset' : '400px'
          s.className = 'listScrollbar'
          s.top = l.navBarHeight + 20 + 'px'
        })
    })
}

const Header = () => {
  const vm = DerTutorContext.self.vmFactory.getMarkdownVM()
  return hstack()
    .react(s => {
      s.gap = '0px'
      s.halign = 'left'
      s.valign = 'center'
      s.bgColor = theme().navBarBg
      s.paddingLeft = layout().leftSideMenuWidth + 'px'
    })
    .children(() => {

      hstack()
        .react(s => {
          s.gap = '20px'
          s.halign = 'left'
          s.valign = 'center'
          s.paddingHorizontal = layout().paddingHorizontal + 'px'
          s.width = layout().contentWidth + 'px'
        })
        .children(() => {
          IconBtn()
            .react(s => {
              s.icon = MaterialIcon.arrow_back
              s.text = translate('Back')
              s.fontSize = theme().fontSizeXS
              s.textColor = theme().link
              s.height = layout().navBarHeight + 'px'
              s.halign = 'left'
              s.width = '100px'
            })
            .whenHovered(s => {
              s.textColor = theme().link100
            })
            .onClick(() => vm.quit())

          p().react(s => {
            s.text = 'Markdown'
            s.textColor = theme().h1
            s.textAlign = 'center'
            s.width = '100%'
            s.fontWeight = 'bold'
            s.fontFamily = FontFamily.APP
            s.fontSize = theme().fontSizeL
          })

          Btn()
            .observe(vm.$editMode)
            .react(s => {
              s.isSelected = vm.$editMode.value
              s.width = '100px'
              s.textAlign = 'right'
              s.text = 'Edit Mode: ' + (s.isSelected ? 'On' : 'Off')
            })
            .onClick(() => vm.$editMode.value = !vm.$editMode.value)
        })

      spacer()

      ThemeSwitcher()
        .react(s => {
          s.visible = !layout().isCompact
          s.position = 'absolute'
          s.right = '20px'
        })
    })
}

const Editor = (title: string, buffer: RXObservableValue<string>, formatter: TextFormatter) => {
  const vm = DerTutorContext.self.vmFactory.getMarkdownVM()
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
        .onKeyDown(e => {
          if (e.key === 'Escape') {
            vm.$editMode.value = false
          }
        })
    })
}

