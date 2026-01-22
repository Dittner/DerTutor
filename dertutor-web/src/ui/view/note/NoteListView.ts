import { btn, div, hlist, hstack, image, p, spacer, span, vlist, vstack } from "flinker-dom"
import { INote, ITag, IVoc } from "../../../domain/DomainModel"
import { AccentBtn, Btn, Icon, IconBtn, LinkBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { globalContext, ThemeSwitcher } from "../../../App"
import { Markdown } from "../../controls/Markdown"
import { DerTutorContext } from "../../../DerTutorContext"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { smallTheme, theme } from "../../theme/ThemeManager"
import { Title } from "../../controls/Text"
import { TextInput } from "../../controls/Input"
import { translate } from "../../../app/LocaleManager"

export const NoteListView = () => {
  const vm = DerTutorContext.self.noteListVM
  return div()
    .onClick(() => vm.$vocabulariesShown.value = false)
    .children(() => {

      Header()
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.left = '0'
          s.top = '0'
          s.width = '100%'
          s.height = layout.navBarHeight + 'px'
          s.layer = '10'
        })

      NotesMenu()
        .observe(vm.$noteListShown)
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.visible = vm.$noteListShown.value
          s.position = 'fixed'
          s.left = '0'
          s.width = (layout.isCompact ? Math.min(400, layout.contentWidth) : layout.leftSideMenuWidth) + 'px'
          s.top = layout.navBarHeight + 'px'
          s.height = window.innerHeight - layout.navBarHeight + 'px'
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
          s.disableHorizontalScroll = true
          s.paddingBottom = layout.statusBarHeight + 'px'
          //s.borderRight = '1px solid ' + theme().border
          s.bgColor = theme().appBg
          s.layer = '1'
        })

      NoteContentView()
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'absolute'
          s.top = layout.navBarHeight + 'px'
          s.paddingTop = '20px'
          s.left = layout.isCompact ? '0' : layout.leftSideMenuWidth + 'px'
          //s.width = layout.isCompact ? '100%' : (layout.contentWidth + 'px')
          s.width = layout.isCompact ? '100%' : layout.contentWidth + 'px'
          s.minHeight = window.innerHeight - layout.navBarHeight + 'px'
          s.paddingHorizontal = layout.paddingHorizontal + 'px'
          s.paddingBottom = layout.statusBarHeight + 'px'
          s.bgColor = theme().articleBg
          //s.cornerRadius = '10px 10px 0px 0px'
        })


      FiltersView()
        .observe(vm.$filtersShown)
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.visible = vm.$filtersShown.value
          s.position = 'fixed'
          s.left = layout.isCompact ? '0px' : (layout.contentWidth + layout.leftSideMenuWidth + 'px')
          s.width = (layout.isCompact ? layout.contentWidth : window.innerWidth - layout.contentWidth - layout.leftSideMenuWidth) + 'px'
          s.top = layout.navBarHeight + 'px'
          s.height = window.innerHeight - layout.statusBarHeight - layout.navBarHeight + 'px'
          s.paddingHorizontal = layout.paddingHorizontal + 'px'
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
          s.bgColor = theme().appBg
          s.layer = '1'
        })
    })
}


const Header = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .observe(globalContext.app.$layout, 'affectsChildrenProps')
    .react(s => {
      s.gap = '10px'
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.bgColor = theme().navBarBg + 'cc'
      s.borderBottom = '1px solid ' + theme().border
      s.halign = 'left'
      s.blur = '10px'
    })
    .children(() => {

      hstack()
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.visible = !layout.isCompact
          s.valign = 'center'
          s.halign = 'left'
          s.height = '100%'
          s.width = layout.leftSideMenuWidth - 10 + 'px'
          s.paddingHorizontal = '20px'
        }).children(() => {
          VocDropdown()
        })

      hstack()
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.valign = 'center'
          s.halign = 'left'
          s.height = '100%'
          s.width = layout.contentWidth + 'px'
          s.gap = '10px'
          //s.paddingHorizontal = layout.paddingHorizontal + 'px'
        }).children(() => {
          HeaderBtn()
            .react(s => {
              s.icon = MaterialIcon.arrow_back
              s.popUp = translate('Go back')
              s.width = '50px'
            })
            .onClick(() => {
              vm.quit()
            })

          HeaderBtn()
            .observe(vm.$noteListShown)
            .react(s => {
              s.visible = globalContext.app.$layout.value.isCompact
              s.isSelected = vm.$noteListShown.value
              s.icon = MaterialIcon.menu
            })
            .onClick(() => {
              vm.$noteListShown.value = !vm.$noteListShown.value
            })

          GlobalSearchView()
            .observe(globalContext.app.$layout)
            .react(s => {
              const layout = globalContext.app.$layout.value
              s.width = layout.isCompact ? '100%' : layout.leftSideMenuWidth - 20 + 'px'
              //s.height = layout.isCompact ? '35px' : layout.navBarHeight + 'px'
            })

        })

      spacer()

      HeaderBtn()
        .observe(vm.$filtersShown)
        .react(s => {
          s.visible = globalContext.app.$layout.value.isCompact
          s.isSelected = vm.$filtersShown.value
          s.icon = MaterialIcon.settings
        })
        .onClick(() => {
          vm.$filtersShown.value = !vm.$filtersShown.value
        })

      ThemeSwitcher()
        .react(s => {
          s.visible = !globalContext.app.$layout.value.isCompact
          s.position = 'absolute'
          s.right = '20px'
        })
    })
}


const VocDropdown = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .react(s => {
      s.valign = 'center'
      s.gap = '10px'
    })
    .children(() => {

      image()
        .observe(vm.$lang)
        .react(s => {
          s.src = vm.$lang.value?.code === 'de' ? '/src/resources/de_flag.svg' : '/src/resources/en_flag.svg'
          s.width = '18px'
          s.height = '18px'
          s.cornerRadius = '18px'
          s.border = '1px solid ' + theme().border
        })

      IconBtn()
        .observe(vm.$vocabulariesShown)
        .react(s => {
          s.isSelected = vm.$vocabulariesShown.value
          s.icon = MaterialIcon.keyboard_arrow_down
          s.textColor = theme().text50
          s.text = translate('Vocabularies')
          s.revert = true
          s.height = '40px'
          s.paddingHorizontal = '0'
          s.cornerRadius = '4px'
          s.iconSize = '1.2rem'
        })
        .whenHovered(s => s.textColor = theme().text)
        .whenSelected(s => s.textColor = theme().text)
        .onClick(e => {
          e.stopImmediatePropagation()
          vm.$vocabulariesShown.value = !vm.$vocabulariesShown.value
        })

      vlist<IVoc>()
        .observe(vm.$lang, 'recreateChildren')
        .observe(vm.$vocabulariesShown, 'affectsProps')
        .observe(globalContext.app.$layout, 'affectsProps')
        .items(() => vm.$lang.value?.vocs ?? [])
        .itemRenderer(VocRenderer)
        .itemHash((item: IVoc) => item.id + item.name)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'absolute'
          s.top = layout.navBarHeight + 'px'

          s.layer = '100'
          s.visible = vm.$vocabulariesShown.value
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.width = '250px'
          s.maxWidth = globalContext.app.$layout.value.leftSideMenuWidth - layout.paddingHorizontal + 'px'
          s.gap = '0'
          s.bgColor = theme().appBg
          s.border = '1px solid ' + theme().border
          s.padding = '12px'
          s.shadow = '0px 6px 6px 3px #00000010'
          s.cornerRadius = '4px'
        })
    })

}
const VocRenderer = (voc: IVoc, index: number) => {
  const vm = DerTutorContext.self.noteListVM
  return p()
    .react(s => {
      s.fontSize = theme().fontSizeXS
      s.textAlign = 'left'
      s.width = '100%'
      s.paddingVertical = '3px'
      s.fontSize = theme().fontSizeXS
      s.text = `${index + 1}. ${voc.name}`
      s.textColor = theme().text
      //s.borderColor = theme().appBg
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textColor = theme().isLight ? theme().link100 : theme().strong
      s.cursor = 'pointer'
    })
    .onClick(() => {
      vm.$lang.value && voc && vm.navigator.navigateTo({ langCode: vm.$lang.value?.code, vocCode: voc && vm.encodeName(voc.name) })
    })
}

const HeaderBtn = () => {
  return IconBtn()
    .react(s => {
      s.icon = MaterialIcon.filter
      s.textColor = theme().text50
      //s.border = '1px solid ' + theme().border
      s.width = '40px'
      s.height = '40px'
      s.cornerRadius = '4px'
      s.iconSize = '1.2rem'
    })
    .whenHovered(s => s.textColor = theme().text)
    .whenSelected(s => {
      s.bgColor = theme().appBg
      s.textColor = theme().accent
    })
}

const GlobalSearchView = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .observe(vm.$searchBufferFocused)
    .react(s => {
      s.gap = '0px'
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.width = '100%'
      s.height = '35px'
      s.border = '1px solid ' + (vm.$searchBufferFocused.value ? theme().red : theme().border)
      s.bgColor = vm.$searchBufferFocused.value ? theme().red + '10' : theme().border + '10'
      s.cornerRadius = '4px'
      s.paddingHorizontal = '5px'
    })
    .children(() => {

      HeaderBtn()
        .observe(vm.$searchBufferFocused)
        .react(s => {
          s.icon = MaterialIcon.search
          s.iconSize = '1.2rem'
        })
        .onClick(() => {
          if (vm.$searchBuffer.value.length > 1) {
            vm.startSearch(vm.$searchBuffer.value)
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
        })

      TextInput(vm.$searchBuffer)
        .observe(vm.$searchBufferFocused)
        .react(s => {
          s.width = '100%'
          s.fontSize = theme().fontSizeS
          s.placeholder = translate('Search...')
          s.border = 'unset'
          s.textColor = theme().isLight ? theme().text : theme().mark
          s.autoFocus = vm.$searchBufferFocused.value
        })
        .whenFocused(s => {
          s.border = 'unset'
        })
        .onKeyDown(e => {
          if (e.key === 'Enter') {
            e.stopImmediatePropagation()
            vm.startSearch(vm.$searchBuffer.value)
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
          else if (e.key === 'Escape') {
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
        })
        .onFocus(() => {
          vm.$searchBufferFocused.value = true
          document.activeElement instanceof HTMLInputElement && document.activeElement.select()
        })
        .onBlur(() => {
          vm.$searchBufferFocused.value = false
        })

      IconBtn()
        .observe(vm.$searchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = vm.$searchBuffer.value.length > 0
          s.icon = MaterialIcon.close
          s.iconSize = theme().fontSizeXS
          s.textColor = theme().appBg
          s.bgColor = theme().text + 'cc'
          s.width = '15px'
          s.height = '15px'
          s.cornerRadius = '15px'
        })
        .whenHovered(s => s.bgColor = theme().text)
        .onClick(() => {
          vm.$searchBuffer.value = ''
          vm.$searchBufferFocused.value = false
          vm.startSearch('')
        })

      KeyboardKey('⌘k')
        .observe(vm.$searchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = vm.$searchBuffer.value.length === 0
        })

      KeyboardKey('f')
        .observe(vm.$searchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = vm.$searchBuffer.value.length === 0
          s.marginLeft = '5px'
        })
    })
}

const KeyboardKey = (value: string) => {
  return p()
    .react(s => {
      s.textColor = theme().text50
      s.text = value
      s.wrap = false
      s.whiteSpace = 'nowrap'
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.ARTICLE
      s.borderColor = theme().border + '88'
      s.bgColor = theme().border + '40'
      s.paddingHorizontal = '8px'
      s.cornerRadius = '4px'
    })
}


const NotesMenu = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
  return vstack()
    .react(s => {
      s.gap = '20px'
      s.paddingTop = '20px'
      s.width = '100%'
    })
    .children(() => {

      Title('')
        .observe(vm.$state)
        .react(s => {
          const p = vm.$state.value.page
          s.text = p && p.pages > 0 ? translate(`Page: ${p.page} of ${p.pages}`) : translate('No data')
          s.paddingLeft = '20px'
        })

      vlist<INote>()
        .observe(vm.$state.pipe().map(s => s.page).removeDuplicates().fork(), 'recreateChildren')
        .observe(vm.$state.pipe().map(s => s.selectedNote?.id).removeDuplicates().fork(), 'affectsChildrenProps')
        .observe(vm.$state.pipe().map(s => s.searchKey).removeDuplicates().fork(), 'affectsChildrenProps')
        .items(() => vm.$state.value.page?.items ?? [])
        .itemRenderer(NoteRenderer)
        .itemHash((item: INote) => item.id + item.name + ':' + (item.id === vm.$state.value.selectedNote?.id))
        .react(s => {
          s.className = theme().id
          s.width = '100%'
          s.paddingHorizontal = '20px'
          s.gap = '0px'
        })

      NotesPaginator()

    })
}

const NoteContentView = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
  return vstack()
    .react(s => {
      s.gap = '50px'
    })
    .children(() => {
      NavBar()

      Markdown()
        .observe(vm.$state)
        .observe(vm.$taskAnswerShown)
        .react(s => {
          const searchKey = vm.$state.value.searchKey ?? ''
          const text = vm.$state.value.selectedNote?.text ?? ''
          s.className = theme().id
          s.mode = 'md'
          s.fontFamily = FontFamily.ARTICLE
          s.textColor = theme().text
          s.width = '100%'
          s.maxWidth = '900px'
          s.mark = searchKey.length > 1 ? searchKey : ''
          s.text = text.replace(/(\?\?([^?]+)\?\?)/g, vm.$taskAnswerShown.value ? '$2' : '\\_\\_\\_')
          s.fontSize = theme().fontSize
          s.absolutePathPrefix = globalContext.server.baseUrl
        })

      AccentBtn()
        .observe(vm.$state)
        .observe(vm.$taskAnswerShown)
        .react(s => {
          const note = vm.$state.value.selectedNote
          s.visible = note && vm.$taskAnswerShown.value === false && note.text.includes('??')
          s.text = translate('Show answer')
          s.popUp = 'Enter'
        })
        .onClick(() => vm.$taskAnswerShown.value = true)

      spacer()

      NextPrevNoteNavigator()
    })
}

const NoteRenderer = (n: INote) => {
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
  return btn()
    .react(s => {
      const searchKey = vm.$state.value.searchKey ?? ''
      s.width = '100%'
      s.isSelected = vm.$state.value.selectedNote?.id === n.id
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().fontSizeXS
      s.paddingRight = '5px'
      s.paddingLeft = '20px'
      s.textAlign = 'left'
      s.paddingVertical = '3px'
      s.wrap = true
      s.whiteSpace = 'normal'
      s.textColor = theme().link
      s.borderLeft = '1px solid ' + theme().border

      const text = n.name
      if (searchKey && text) {
        const keyIndex = text.toLowerCase().indexOf(searchKey.toLowerCase())
        s.htmlText = keyIndex !== -1 ? text.slice(0, keyIndex) + '<mark>' + text.slice(keyIndex, keyIndex + searchKey.length) + '</mark>' + (text.slice(keyIndex + searchKey.length) ?? '') : text
      } else {
        s.text = text.length > 80 ? text.substring(0, 80) + '...' : text
      }
    })
    .whenHovered(s => {
      s.textColor = theme().link100
      s.cursor = 'pointer'
    })
    .whenSelected(s => {
      s.textColor = theme().link100
      s.borderLeft = '1px solid ' + theme().link100
    })
    .onClick(() => {
      vm.reloadWithNote(n)
    })
}

const NotesPaginator = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
      s.valign = 'center'
      s.halign = 'left'
      s.paddingHorizontal = '20px'
      s.minHeight = '30px'
      s.fontFamily = FontFamily.MONO
    })
    .children(() => {

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.isDisabled = !p || p.page <= 1
          s.text = '«'
          s.wrap = false
          s.paddingHorizontal = '10px'
          s.borderColor = theme().border
          s.popUp = translate('Previous page')
        })
        .onClick(() => vm.$state.value.page && vm.navigator.updateWith({ page: vm.$state.value.page?.page - 1 }))

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page > 1
          s.text = '1'
          s.wrap = false
          s.popUp = translate('First page')
        })
        .onClick(() => vm.navigator.updateWith({ page: 1 }))

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page > 2
          s.text = p ? `${p.page - 1}` : ''
          s.wrap = false
          s.popUp = translate('Previous page')
          //s.href = vm.getPageLink(p ? p.page + 1 : 1)
        })
        .onClick(() => {
          const p = vm.$state.value.page
          p && p.page > 0 && vm.navigator.updateWith({ page: p.page - 1 })
        })

      p()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.pages > 0
          s.text = p ? `${p.page}` : ''
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.cornerRadius = '2px'
          s.textSelectable = false
          s.textColor = theme().accent + 'cc'
        })

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page < p.pages - 1
          s.text = p ? `${p.page + 1}` : ''
          s.wrap = false
          s.popUp = translate('Next page')
          //s.href = vm.getPageLink(p ? p.page + 1 : 1)
        })
        .onClick(() => {
          const p = vm.$state.value.page
          p && p.page < p.pages && vm.navigator.updateWith({ page: p.page + 1 })
        })

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page < p.pages
          s.text = p ? `${p.pages}` : ''
          s.wrap = false
          s.popUp = translate('Last page')
        })
        .onClick(() => {
          const p = vm.$state.value.page
          p && vm.navigator.updateWith({ page: p.pages })
        })

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.isDisabled = !p || p.page >= p.pages
          s.text = '»'
          s.wrap = false
          s.paddingHorizontal = '10px'
          s.borderColor = theme().border
          s.popUp = translate('Next page')
        })
        .onClick(() => vm.$state.value.page && vm.navigator.updateWith({ page: vm.$state.value.page?.page + 1 }))
    })
}

const NavBar = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
      s.whiteSpace = 'nowrap'
      s.valign = 'top'
      s.halign = 'left'
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.MONO
    })
    .children(() => {
      hstack()
        .react(s => {
          s.width = '50%'
          s.gap = '10px'
          s.valign = 'top'
        })
        .children(() => {
          IconBtn()
            .react(s => {
              s.icon = MaterialIcon.home
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
            .react(s => {
              s.text = vm.$state.value.lang?.name ?? ''
            }).onClick(() => {
              vm.$state.value.lang && vm.navigator.navigateTo({ langCode: vm.$state.value.lang?.code })
            })

          span()
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
            .react(s => {
              const lang = vm.$state.value.lang
              const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
              s.visible = lang !== undefined && voc !== undefined
              s.text = voc?.name ?? ''
            })
            .onClick(() => {
              const lang = vm.$state.value.lang
              const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
              lang && voc && vm.navigator.navigateTo({ langCode: lang?.code, vocCode: voc && vm.encodeName(voc.name) })
            })
        })


      p()
        .observe(vm.$noteNummberOfTotal)
        .react(s => {
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().fontSizeXS
          s.textColor = theme().text50
          s.text = vm.$noteNummberOfTotal.value
          s.textAlign = 'center'
          s.width = '50%'
        })

      hstack()
        .react(s => {
          s.width = '50%'
          s.gap = '10px'
          s.valign = 'center'
          s.halign = 'right'
        })
        .children(() => {
          Btn()
            .observe(vm.$state)
            .react(s => {
              const hasAudio = vm.$state.value.selectedNote !== undefined && vm.$state.value.selectedNote.audio_url !== ''
              s.visible = hasAudio
              s.icon = MaterialIcon.volume_up
              s.textColor = theme().text50
              //s.text = 'Audio'
              s.minHeight = 'unset'
            })
            .whenHovered(s => {
              s.textColor = theme().text
            })
            .onClick(() => vm.playAudio(vm.$state.value.selectedNote?.audio_url ?? ''))

          NoteMeta()
        })
    })
}

const NoteMeta = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
  return p()
    .observe(vm.$state)
    .react(s => {
      const note = vm.$state.value.selectedNote
      const level = note ? vm.reprLevel(note.level) : ''
      const tag = vm.reprTag(note?.tag_id)
      s.text = ''
      if (level && tag) s.text += level + ', ' + tag
      else if (level) s.text += level
      else if (tag) s.text += tag
      s.visible = s.text !== ''
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().fontSizeXS
      s.fontWeight = 'bold'
      s.textColor = theme().text
    })
}

const FiltersView = () => {
  return vstack()
    .react(s => {
      s.gap = '0'
      s.paddingTop = '20px'
    })
    .children(() => {
      Title('Filter by level:')
      LevelsBar()

      spacer().react(s => s.height = '20px')

      Title('Filter by tag:')
      TagSelector()

      spacer().react(s => s.height = '20px')

      Title('Quick search:')
      QuickSearchPanel()
    })
}

const LevelsBar = () => {
  const vm = DerTutorContext.self.noteListVM
  return hlist<number>()
    .observe(vm.$state, 'affectsChildrenProps')
    .items(() => [1, 2, 3, 4, 5, 6])
    .itemRenderer(LevelRenderer)
    .itemHash((item: number) => item + ':' + (item === vm.$state.value.level))
    .react(s => {
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.MONO
      s.gap = '10px'
      s.width = '100%'
      s.halign = 'left'
    })
}

const LevelRenderer = (level: number) => {
  const vm = DerTutorContext.self.noteListVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$state.value.level === level
      s.wrap = false
      s.textColor = theme().text50
      s.text = vm.reprLevel(level)
      s.textAlign = 'left'
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().accent
    })
    .onClick(() => vm.navigator.updateWith({ page: 1, level: vm.$state.value.level === level ? undefined : level }))
}

const TagSelector = () => {
  const vm = DerTutorContext.self.noteListVM
  return vlist<ITag>()
    .observe(vm.$state.pipe().map(s => s.lang?.tags).removeDuplicates().fork(), 'recreateChildren')
    .observe(vm.$state.pipe().map(s => s.tagId).removeDuplicates().fork(), 'affectsChildrenProps')
    .items(() => vm.$state.value.lang?.tags ?? [])
    .itemRenderer(TagRenderer)
    .itemHash((item: ITag) => item.id + ':' + (item.id === vm.$state.value.tagId))
    .react(s => {
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.MONO
      s.gap = '10px'
      s.width = '100%'
      s.halign = 'left'
    })
}

const TagRenderer = (t: ITag) => {
  const vm = DerTutorContext.self.noteListVM
  return Btn()
    .react(s => {
      s.isSelected = vm.$state.value.tagId === t.id
      s.text = t.name
    })
    .onClick(() => vm.navigator.updateWith({ page: 1, tagId: vm.$state.value.tagId === t.id ? undefined : t.id }))
}

const QuickSearchPanel = () => {
  const vm = DerTutorContext.self.noteListVM
  return vstack()
    .react(s => {
      s.gap = '0px'
      s.width = '100%'
      s.height = '100%'
      s.fontFamily = FontFamily.APP
    })
    .children(() => {

      QuickSearchInput()

      Btn()
        .observe(vm.$quickSearchResult)
        .react(s => {
          const audioUrl = vm.$quickSearchResult.value?.audio_url ?? ''
          s.mouseEnabled = audioUrl !== ''
          s.marginTop = '5px'
          s.icon = MaterialIcon.volume_up
          s.opacity = audioUrl !== '' ? '1' : '0'
        })
        .onClick(() => vm.playAudio(vm.$quickSearchResult.value?.audio_url ?? ''))

      Markdown()
        .observe(vm.$quickSearchBuffer)
        .observe(vm.$quickSearchResult)
        .react(s => {
          s.visible = vm.$quickSearchBuffer.value.length > 0
          s.className = theme().isLight ? 'light-small' : 'dark-small'
          s.lineHeight = '1.4'
          s.mode = 'md'
          s.fontFamily = FontFamily.ARTICLE
          s.textColor = smallTheme().text
          s.width = '100%'
          s.text = vm.$quickSearchResult.value?.text ?? ''
          s.fontSize = '0.8rem'
          s.absolutePathPrefix = globalContext.server.baseUrl
        })
    })
}

const QuickSearchInput = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .observe(vm.$quickSearchFocused)
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.halign = 'stretch'
      s.width = '100%'
      s.gap = '5px'
      s.maxWidth = '300px'
      s.height = '35px'
      s.border = '1px solid ' + (vm.$quickSearchFocused.value ? theme().accent : theme().border)
      s.cornerRadius = '4px'
      s.paddingHorizontal = '5px'
    })
    .children(() => {

      Icon()
        .react(s => {
          s.value = MaterialIcon.search
          s.width = '30px'
          s.maxWidth = '30px'
          s.textAlign = 'center'
          s.textColor = theme().text50
        })

      TextInput(vm.$quickSearchBuffer)
        .observe(vm.$quickSearchFocused)
        .react(s => {
          s.width = '100%'
          //s.maxWidth = '300px'
          s.autoFocus = vm.$quickSearchFocused.value
          s.fontSize = theme().fontSizeXS
          s.placeholder = translate('Enter a word to search')
          s.border = 'unset'
          s.textColor = theme().strong
          s.caretColor = theme().accent
        })
        .whenFocused(s => {
          s.textColor = theme().accent
        })
        .onBlur(() => { vm.$quickSearchFocused.value = false })
        .onFocus(() => {
          vm.$quickSearchFocused.value = true
          document.activeElement instanceof HTMLInputElement && document.activeElement.select()
        })
        .onKeyDown(e => {
          if (e.key === 'Enter') {
            e.stopImmediatePropagation()
            vm.quickSearch(vm.$quickSearchBuffer.value)
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
          else if (e.key === 'Escape') {
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
            vm.clearQuickSearchResults()
          }
        })

      KeyboardKey('/')
        .observe(vm.$quickSearchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = vm.$quickSearchBuffer.value.length === 0
        })

      IconBtn()
        .observe(vm.$quickSearchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = vm.$quickSearchBuffer.value.length > 0
          s.icon = MaterialIcon.close
          s.iconSize = theme().fontSizeXS
          s.textColor = theme().appBg
          s.bgColor = theme().text + 'cc'
          s.width = '15px'
          s.height = '15px'
          s.cornerRadius = '15px'
        })
        .whenHovered(s => s.bgColor = theme().text)
        .onClick(() => {
          vm.clearQuickSearchResults()
        })
    })
}

const NextPrevNoteNavigator = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .observe(vm.$selectedNoteIndex, 'affectsChildrenProps')
    .react(s => {
      s.gap = '10px'
      s.width = '100%'
      s.valign = 'center'
    })
    .children(() => {
      Btn()
        .react(s => {
          const page = vm.$state.value.page
          if (page) {
            const selectedNoteIndex = vm.$selectedNoteIndex.value
            const selectedPageIndex = page.page ?? 0
            s.visible = selectedNoteIndex > 0 || selectedPageIndex > 1
            s.text = selectedNoteIndex > 0 ? page.items[selectedNoteIndex - 1].name : translate(`Page ${selectedPageIndex - 1}`)
          } else {
            s.visible = false
          }

          s.paddingHorizontal = '0'
          s.icon = MaterialIcon.arrow_back
          s.halign = 'left'
          s.width = '50%'
          s.height = '40px'
          s.textColor = theme().link
        })
        .whenHovered(s => {
          s.textColor = theme().link100
        })
        .onClick(() => {
          vm.movePrev()
        })

      spacer()

      Btn()
        .react(s => {
          const page = vm.$state.value.page
          if (page) {
            const selectedNoteIndex = vm.$selectedNoteIndex.value
            const selectedPageIndex = page.page ?? 0
            s.visible = selectedNoteIndex < page.items.length || selectedPageIndex < page.pages
            if (selectedNoteIndex < page.items.length - 1) s.text = page.items[selectedNoteIndex + 1].name
            else if (selectedPageIndex < page.pages) s.text = translate(`Page ${selectedPageIndex + 1}`)
            else s.text = ''
          }

          s.visible = s.text !== ''

          s.icon = MaterialIcon.arrow_forward
          s.revert = true
          s.halign = 'left'
          s.width = '50%'
          s.height = '40px'
          s.textColor = theme().link
        })
        .whenHovered(s => {
          s.textColor = theme().link100
        })
        .onClick(() => {
          vm.moveNext()
        })
    })
}