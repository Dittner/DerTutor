import { btn, hlist, hstack, image, p, spacer, vlist, vstack } from "flinker-dom"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { layout } from "../../../app/Application"
import { Btn, Icon, IconBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { translate } from "../../../app/LocaleManager"
import { INote, ITag, IVoc } from "../../../domain/DomainModel"
import { globalContext } from "../../../App"
import { ViewLayer } from "../../../app/ViewLayer"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { KeyboardKey, Title } from "../../controls/Text"
import { TextInput } from "../../controls/Input"

export const NotesMenu = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return vstack()
    .react(s => {
      s.gap = '20px'
      //s.paddingTop = '20px'
      s.width = '100%'
    })
    .children(() => {

      vstack()
        .react(s => {
          s.valign = 'center'
          s.halign = 'left'
          //s.height = '150px'
          s.gap = '0'
          s.bgColor = theme().menuHeaderBg
          s.width = '100%'
          s.paddingHorizontal = '20px'
        }).children(() => {
          hstack()
            .react(s => {
              s.width = '100%'
              s.valign = 'center'
              s.gap = '10px'
              s.height = layout().navBarHeight + 'px'
            })
            .children(() => {

              VocDropdown()

              spacer()

              FilterDropdown()
                .observe(vm.$state)
                .react(s => {
                  const state = vm.$state.value
                  s.visible = state.lang !== undefined && state.voc !== undefined && state.lang.id === state.voc.id
                })

              IconBtn()
                .observe(vm.$noteListShown)
                .react(s => {
                  s.visible = layout().isCompact
                  s.icon = MaterialIcon.close
                  s.textColor = theme().text50
                  s.iconSize = theme().fontSizeXL
                })
                .whenHovered(s => s.textColor = theme().text)
                .onClick(() => {
                  vm.$noteListShown.value = false
                })
            })


          hstack()
            .react(s => {
              s.valign = 'center'
              s.halign = 'left'
              //s.height = '100%'
              s.width = '100%'
              s.height = layout().navBarHeight + 'px'
              s.gap = '10px'
            }).children(() => {

              GlobalSearchView()
                .react(s => {
                  s.width = '100%'
                  //s.maxWidth = '300px'
                  //s.height = layout().isCompact ? '35px' : layout().navBarHeight + 'px'
                })
            })

        })

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
          s.className = 'listScrollbar ' + theme().id
          s.width = '100%'
          s.maxHeight = '100%'
          s.enableOwnScroller = true
          s.disableHorizontalScroll = true
          s.paddingHorizontal = '20px'
        })

      NotesPaginator()

    })
}


const VocDropdown = () => {
  const dropdownId = 'NoteListView.VocSelector'
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
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
          s.width = '15px'
          s.height = '15px'
          s.cornerRadius = '15px'
          //s.border = '1px solid ' + theme().border
        })

      IconBtn()
        .observe(globalContext.app.$dropdownState)
        .react(s => {
          s.isSelected = globalContext.app.$dropdownState.value === dropdownId
          s.icon = MaterialIcon.keyboard_arrow_down
          s.textColor = theme().white + 'cc'
          s.text = translate('Vocabularies')
          s.fontSize = theme().fontSizeS
          s.revert = true
          s.valign = 'bottom'
          //s.height = '40px'
          s.paddingHorizontal = '0'
          s.cornerRadius = '4px'
          //s.iconSize = '1.2rem'
        })
        .whenHovered(s => s.textColor = theme().white)
        .whenSelected(s => s.textColor = theme().white)
        .onClick(e => {
          e.stopImmediatePropagation()
          globalContext.app.$dropdownState.value = globalContext.app.$dropdownState.value === dropdownId ? '' : dropdownId
        })

      vlist<IVoc>()
        .observe(vm.$lang, 'recreateChildren')
        .observe(globalContext.app.$dropdownState)
        .items(() => vm.$lang.value?.vocs ?? [])
        .itemRenderer(VocRenderer)
        .itemHash((item: IVoc) => item.id + item.name)
        .react(s => {
          s.visible = globalContext.app.$dropdownState.value === dropdownId
          s.position = 'fixed'
          s.top = layout().navBarHeight + 'px'
          s.layer = ViewLayer.MODAL_VIEW_CONTENT
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.width = '250px'
          s.maxWidth = layout().leftSideMenuWidth - layout().paddingHorizontal + 'px'
          s.gap = '0'
          s.bgColor = theme().appBg
          s.border = '1px solid ' + theme().border
          s.padding = '12px'
          s.shadow = '0px 6px 6px 3px #00000010'
          s.cornerRadius = '4px'
        })
    })
}

const VocRenderer = (voc: IVoc) => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return p()
    .react(s => {
      s.fontSize = theme().fontSizeXS
      s.textAlign = 'left'
      s.width = '100%'
      s.paddingVertical = '3px'
      s.fontSize = theme().fontSizeXS
      s.text = voc.name
      s.textColor = theme().text
      //s.borderColor = theme().appBg
      s.textSelectable = false
    })
    .whenHovered(s => {
      s.textColor = theme().strong
      s.cursor = 'pointer'
    })
    .onClick(() => {
      vm.$lang.value && voc && vm.navigator.navigateTo({ langCode: vm.$lang.value?.code, vocCode: voc && vm.encodeName(voc.name), sort: voc.sort_notes })
    })
}


const FilterDropdown = () => {
  const dropdownId = 'NoteListView.Filters'
  return hstack()
    .react(s => {
      s.valign = 'center'
      s.gap = '10px'
    })
    .children(() => {

      IconBtn()
        .observe(globalContext.app.$dropdownState)
        .react(s => {
          s.isSelected = globalContext.app.$dropdownState.value === dropdownId
          s.icon = MaterialIcon.settings
          s.textColor = theme().white + 'cc'
          s.text = translate('Filter')
          s.fontSize = theme().fontSizeS
          s.revert = true
          s.valign = 'bottom'
          //s.height = '40px'
          s.paddingHorizontal = '0'
          s.cornerRadius = '4px'
          //s.iconSize = '1.2rem'
        })
        .whenHovered(s => s.textColor = theme().white)
        .whenSelected(s => s.textColor = theme().white)
        .onClick(e => {
          e.stopImmediatePropagation()
          globalContext.app.$dropdownState.value = globalContext.app.$dropdownState.value === dropdownId ? '' : dropdownId
        })

      FiltersView()
        .observe(globalContext.app.$dropdownState)
        .react(s => {
          //s.visible = vm.$filtersShown.value
          s.visible = globalContext.app.$dropdownState.value === dropdownId
          s.position = 'fixed'
          //s.left = layout.isCompact ? '0px' : (layout.contentWidth + layout.leftSideMenuWidth + 'px')
          //s.width = (layout.isCompact ? layout.contentWidth : window.innerWidth - layout.contentWidth - layout.leftSideMenuWidth) + 'px'
          s.top = layout().navBarHeight + 'px'
          s.layer = ViewLayer.MODAL_VIEW_CONTENT
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.width = '250px'
          s.bgColor = theme().appBg
          s.border = '1px solid ' + theme().border
          s.padding = '12px'
          s.shadow = '0px 6px 6px 3px #00000010'
          s.cornerRadius = '4px'
        })
    })

}


const FiltersView = () => {
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {
      Title('Filter by level:')
      LevelsBar()

      spacer().react(s => s.height = '20px')

      Title('Filter by tag:')
      TagSelector()
    })
}

const LevelsBar = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
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
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
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
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
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
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return Btn()
    .react(s => {
      s.isSelected = vm.$state.value.tagId === t.id
      s.text = t.name
    })
    .onClick(() => vm.navigator.updateWith({ page: 1, tagId: vm.$state.value.tagId === t.id ? undefined : t.id }))
}


const GlobalSearchView = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  const INPUT_HEI = '30px'
  return hstack()
    //.observe(vm.$searchBufferFocused)
    .react(s => {
      s.gap = '5px'
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.width = '100%'
      s.height = INPUT_HEI
      //s.border = '1px solid ' + (vm.$searchBufferFocused.value ? theme().red : theme().border)
      //s.bgColor = vm.$searchBufferFocused.value ? theme().red + '10' : theme().border + '10'

      //s.paddingHorizontal = '20px'
      //s.paddingRight = '5px'
    })
    .children(() => {

      hstack()
        .observe(vm.$searchBufferFocused, 'affectsProps', 'affectsChildrenProps')
        .react(s => {
          s.width = '100%'
          s.height = '100%'
          s.valign = 'center'
          s.bgColor = vm.$searchBufferFocused.value ? theme().white : theme().white + '20'
          s.cornerRadius = INPUT_HEI
          s.paddingHorizontal = '10px'
        })
        .children(() => {
          Icon()
            .react(s => {
              s.value = MaterialIcon.search
              s.fontSize = theme().fontSize
              s.textColor = vm.$searchBufferFocused.value ? theme().black + 'cc' : theme().white + 'cc'
            })

          TextInput(vm.$searchBuffer)
            .react(s => {
              s.width = '100%'
              s.height = INPUT_HEI
              s.fontSize = theme().fontSizeS
              s.placeholder = translate('Search...')
              s.border = 'unset'
              s.textColor = theme().white
              s.autoFocus = vm.$searchBufferFocused.value
            })
            .whenFocused(s => {
              s.border = 'unset'
              s.textColor = theme().black
            })
            .whenPlaceholderShown(s => {
              s.textColor = theme().white + '88'
            })
            .onKeyDown(e => {
              if (e.key === 'Enter') {
                e.stopImmediatePropagation()
                vm.startSearch(vm.$searchBuffer.value)
                globalContext.app.clearInputFocus()
              }
              else if (e.key === 'Escape') {
                globalContext.app.clearInputFocus()
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
              s.textColor = theme().black
              s.bgColor = theme().white + 'cc'
              s.width = '15px'
              s.height = '15px'
              s.right = '105px'
              s.cornerRadius = '15px'
            })
            .whenHovered(s => s.bgColor = theme().white)
            .onClick(() => {
              vm.$searchBuffer.value = ''
              vm.$searchBufferFocused.value = false
              vm.startSearch('')
            })
        })

      KeyboardKey('⌘k')
      KeyboardKey('f')
    })
}

const NoteRenderer = (n: INote) => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
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
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
      s.gap = '10px'
      s.valign = 'center'
      s.halign = 'left'
      s.paddingHorizontal = '20px'
      s.minHeight = '30px'
    })
    .children(() => {

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.isDisabled = !p || p.page <= 1
          s.fontFamily = FontFamily.MONO
          s.text = '«'
          s.wrap = false
          s.paddingBottom = '2px'
          s.paddingHorizontal = '10px'
          s.borderColor = theme().border
          s.popUp = translate('Previous page')
        })
        .onClick(() => vm.$state.value.page && vm.navigator.updateWith({ page: vm.$state.value.page?.page - 1 }))

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page > 1
          s.fontFamily = FontFamily.MONO
          s.text = '1'
          s.wrap = false
          s.popUp = translate('First page')
        })
        .onClick(() => vm.navigator.updateWith({ page: 1 }))

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page > 2
          s.fontFamily = FontFamily.MONO
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
          s.fontFamily = FontFamily.MONO
          s.text = p ? `${p.page}` : ''
          s.fontSize = theme().fontSizeXS
          s.textSelectable = false
          s.textColor = theme().accent + 'bb'
        })

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page < p.pages - 1
          s.fontFamily = FontFamily.MONO
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
          s.fontFamily = FontFamily.MONO
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
          s.fontFamily = FontFamily.MONO
          s.text = '»'
          s.paddingBottom = '2px'
          s.wrap = false
          s.paddingHorizontal = '10px'
          s.borderColor = theme().border
          s.popUp = translate('Next page')
        })
        .onClick(() => vm.$state.value.page && vm.navigator.updateWith({ page: vm.$state.value.page?.page + 1 }))
    })
}
