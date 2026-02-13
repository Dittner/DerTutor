import { div, hstack } from "flinker-dom"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { ViewLayer } from "../../../app/ViewLayer"
import { layout } from "../../../app/Application"
import { NotesMenu } from "./NotesMenu"
import { NoteContentView } from "./NoteContent"
import { FontFamily } from "../../controls/Font"
import { IconBtn } from "../../controls/Button"
import { globalContext, ThemeSwitcher } from "../../../App"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { translate } from "../../../app/LocaleManager"
import { VSeparator } from "../../controls/Text"
import { QuickSearchPanel } from "../../controls/QuickSearch"

export const NoteListView = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return div()
    .children(() => {

      NotesMenu()
        .observe(vm.$noteListShown)
        .react(s => {
          const l = layout()
          s.visible = vm.$noteListShown.value
          s.position = 'fixed'
          s.left = '0'
          s.width = (l.isCompact ? l.contentWidth : l.leftSideMenuWidth) + 'px'
          s.top = '0'
          s.height = '100%'

          s.paddingBottom = l.statusBarHeight + 'px'
          //s.borderRight = '1px solid ' + theme().border
          s.bgColor = theme().menuBg
          s.layer = ViewLayer.ONE
        })

      NoteContentView()
        .react(s => {
          const l = layout()
          s.position = 'absolute'
          s.top = '0'
          //s.paddingTop = l.navBarHeight + 'px'
          s.left = l.isCompact ? '0' : l.leftSideMenuWidth + 'px'
          //s.width = layout.isCompact ? '100%' : (layout.contentWidth + 'px')
          s.width = l.isCompact ? '100%' : l.contentWidth + 'px'
          s.minHeight = window.innerHeight + 'px'
          s.paddingHorizontal = l.paddingHorizontal + 'px'
          s.paddingBottom = l.statusBarHeight + 'px'
          //s.cornerRadius = '10px 10px 0px 0px'
        })

      Header().react(s => {
        s.position = layout().isCompact ? 'absolute' : 'fixed'
        s.height = layout().navBarHeight + 'px'
        s.right = '20px'
      })

      QuickSearchPanel(vm.quiclSearchController)
        .observe(vm.quiclSearchController.$quickSearchResult)
        .observe(vm.quiclSearchController.$quickSearchFocused)
        .react(s => {
          const l = layout()
          s.position = 'fixed'
          s.top = l.navBarHeight + 'px'
          s.right = l.isCompact ? '0' : '20px'
          s.visible = vm.quiclSearchController.$quickSearchResult.value !== undefined || vm.quiclSearchController.$quickSearchFocused.value
          s.width = l.isCompact ? '100%' : l.leftSideMenuWidth + 'px'
          s.height = l.isCompact ? '100%' : 'unset'
          s.maxHeight = vm.quiclSearchController.$quickSearchResult.value ? window.innerHeight - l.navBarHeight - l.statusBarHeight + 'px' : 'unset'
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
        })
    })
}

const Header = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return hstack()
    .react(s => {
      s.gap = '20px'
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.height = layout().navBarHeight + 'px'
      s.halign = 'right'
      //s.width = '100%'
    })
    .children(() => {
      IconBtn()
        .observe(globalContext.app.$dropdownState)
        .react(s => {
          s.icon = MaterialIcon.search
          s.textColor = theme().white + 'cc'
          s.text = translate('Quick search')
          s.fontSize = theme().fontSizeS
          s.valign = 'bottom'
          s.paddingHorizontal = '0'
          s.iconSize = '1rem'
        })
        .whenHovered(s => s.textColor = theme().white)
        .onClick(e => {
          e.stopImmediatePropagation()
          vm.quiclSearchController.$quickSearchFocused.value = true
        })

      VSeparator()

      ThemeSwitcher()
    })
}
