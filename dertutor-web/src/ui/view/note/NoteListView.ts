import { div, hstack, spacer, span } from "flinker-dom"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { ViewLayer } from "../../../app/ViewLayer"
import { layout } from "../../../app/Application"
import { NotesMenu } from "./NotesMenu"
import { NoteContentView } from "./NoteContent"
import { FontFamily } from "../../controls/Font"
import { IconBtn, LinkBtn } from "../../controls/Button"
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
          s.top = '0'
          s.width = (l.isCompact ? l.contentWidth : l.leftSideMenuWidth) + 'px'
          s.height = '100%'
          s.paddingTop = l.isCompact ? l.navBarHeight + 'px' : '0'
          s.paddingBottom = l.statusBarHeight + 'px'
          //s.borderRight = '1px solid ' + theme().border
          s.bgColor = theme().menuBg
          s.layer = ViewLayer.ONE
        })

      NoteContentView()
        .react(s => {
          const l = layout()
          s.position = 'absolute'
          s.top = layout().navBarHeight + 'px'
          //s.paddingTop = l.navBarHeight + 'px'
          s.left = l.isCompact ? '0' : l.leftSideMenuWidth + 'px'
          //s.width = layout.isCompact ? '100%' : (layout.contentWidth + 'px')
          s.width = l.isCompact ? '100%' : l.contentWidth + 'px'
          s.minHeight = window.innerHeight - layout().navBarHeight + 'px'
          s.paddingHorizontal = l.paddingHorizontal + 'px'
          s.paddingBottom = l.statusBarHeight + 'px'
          //s.cornerRadius = '10px 10px 0px 0px'
        })

      Header().react(s => {
        const l = layout()
        s.position = 'fixed'
        s.height = l.navBarHeight + 'px'
        s.width = l.isCompact ? '100%' : l.pageWidth - l.leftSideMenuWidth + 'px'
        s.left = l.leftSideMenuWidth + 'px'
        s.paddingLeft = l.isCompact ? '20px' : l.paddingHorizontal + 'px'
        s.paddingRight = '20px'
        s.layer = ViewLayer.HEADER
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
      s.halign = 'left'
      s.bgColor = layout().isCompact ? theme().navBarBg : theme().appBg
    })
    .children(() => {
      NavBar().react(s => {
        s.left = layout().leftSideMenuWidth + 'px'
        s.width = layout().contentWidth - 2 * layout().paddingHorizontal + 'px'
      })

      spacer()

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


const NavBar = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return hstack()
    .react(s => {
      s.gap = '10px'
      s.whiteSpace = 'nowrap'
      s.valign = 'center'
      s.halign = 'left'
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.MONO
      s.height = layout().navBarHeight + 'px'
    })
    .children(() => {

      IconBtn()
        .observe(vm.$noteListShown)
        .react(s => {
          s.isSelected = vm.$noteListShown.value
          s.icon = MaterialIcon.menu
          s.iconSize = theme().fontSizeL
          s.textColor = theme().text50
          s.paddingRight = '10px'
          s.popUp = 'Show/Hide menu. Press m'
        })
        .whenHovered(s => s.textColor = theme().text)
        .whenSelected(s => s.textColor = theme().white + 'cc')
        .onClick(() => {
          vm.$noteListShown.value = !vm.$noteListShown.value
        })

      IconBtn()
        .react(s => {
          s.icon = MaterialIcon.language
          s.iconSize = theme().fontSizeS
          s.textColor = theme().link
          s.wrap = false
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.paddingVertical = '5px'
        })
        .whenHovered(s => s.textColor = theme().link100)
        .onClick(() => {
          vm.$state.value.lang && vm.navigator.navigateTo({})
        })

      span()
        .react(s => {
          s.text = ' › '
          s.paddingVertical = '2px'
          s.textColor = theme().link + 'bb'
          s.textSelectable = false
        })

      LinkBtn()
        .observe(vm.$state)
        .react(s => {
          s.text = vm.$state.value.lang?.name ?? ''
          s.textColor = theme().link
        })
        .whenHovered(s => {
          s.textColor = theme().link100
        })
        .onClick(() => {
          vm.$state.value.lang && vm.navigator.navigateTo({ langCode: vm.$state.value.lang?.code })
        })

      span()
        .observe(vm.$state)
        .react(s => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          s.visible = lang !== undefined && voc !== undefined
          s.text = ' › '
          s.paddingVertical = '2px'
          s.textColor = theme().link + 'bb'
          s.textSelectable = false
        })

      LinkBtn()
        .observe(vm.$state)
        .react(s => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          s.visible = lang !== undefined && voc !== undefined
          s.text = voc?.name ?? ''
          s.textColor = theme().link
          s.maxWidth = layout().isCompact ? '120px' : '100%'
          s.overflow = 'hidden'
          s.textOverflow = 'ellipsis'
        })
        .whenHovered(s => {
          s.textColor = theme().link100
        })
        .onClick(() => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          lang && voc && vm.navigator.navigateTo({ langCode: lang?.code, vocCode: voc && vm.encodeName(voc.name) })
        })
    })
}
