import { btn, div, hlist, hstack, p, spacer, span, vlist, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { INote, ITag } from "../../../domain/DomainModel"
import { Btn, Icon, IconBtn, LinkBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { Markdown } from "../../controls/Markdown"
import { DerTutorContext } from "../../../DerTutorContext"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { theme } from "../../theme/ThemeManager"
import { Title } from "../../controls/Text"
import { TextInput } from "../../controls/Input"

export const NoteListView = () => {
  return div()
    .children(() => {

      NotesMenu()
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.left = '0'
          s.width = (layout.isMobile ? layout.contentWidth : layout.sideSpaceWidth) + 'px'
          s.top = layout.navBarHeight + 'px'
          s.height = window.innerHeight - layout.statusBarHeight - layout.navBarHeight + 'px'
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
        })

      NoteContentView()
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'absolute'
          s.top = '0px'
          s.left = layout.sideSpaceWidth + 'px'
          s.width = layout.contentWidth + 'px'
          s.minHeight = window.innerHeight + 'px'
          s.paddingTop = layout.navBarHeight + 'px'
          s.paddingBottom = layout.statusBarHeight + 'px'
        })

      FiltersView()
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.right = '5px'
          s.width = (layout.isMobile ? layout.contentWidth : layout.sideSpaceWidth) + 'px'
          s.top = layout.navBarHeight + 'px'
          s.height = window.innerHeight - layout.statusBarHeight - layout.navBarHeight + 'px'
          s.className = 'listScrollbar'
          s.enableOwnScroller = true
        })
    })
}
const NoteContentView = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
  return vstack()
    .react(s => {
      s.gap = '50px'
      s.paddingRight = '20px'
    })
    .children(() => {
      NavBar()

      hstack()
        .react(s => {
          s.width = '100%'
          s.gap = '0'
        })
        .children(() => {
          Btn()
            .observe(vm.$state)
            .react(s => {
              const hasAudio = vm.$state.value.selectedNote !== undefined && vm.$state.value.selectedNote.audio_url !== ''
              s.mouseEnabled = hasAudio
              s.position = 'relative'
              s.left = '-20px'
              s.icon = MaterialIcon.volume_up
              s.width = '20px'
              s.height = '62px'
              s.opacity = hasAudio ? '1' : '0'
            })
            .onClick(() => vm.playAudio(vm.$state.value.selectedNote?.audio_url ?? ''))

          Markdown()
            .observe(vm.$state)
            .react(s => {
              const searchKey = vm.$state.value.searchKey ?? ''
              s.className = theme().id
              s.mode = 'md'
              s.fontFamily = FontFamily.ARTICLE
              s.textColor = theme().text
              s.width = '100%'
              s.mark = searchKey.length > 1 ? searchKey : ''
              s.text = vm.$state.value.selectedNote?.text ?? ''
              s.fontSize = theme().fontSize
              s.absolutePathPrefix = globalContext.server.baseUrl
              //s.showRawText = page.file.showRawText
            })
        })

      spacer()
      NexPrevNoteNavigator()
    })
}
const NotesMenu = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
  return vstack()
    .react(s => {
      s.gap = '0'
    })
    .children(() => {
      Title('')
        .observe(vm.$state)
        .react(s => {
          const p = vm.$state.value.page
          s.text = p && p.pages > 0 ? `Page: ${p.page} of ${p.pages}` : 'No pages'
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
          s.gap = '0'
        })

      NotesPaginator()

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
      s.wrap = true
      s.whiteSpace = 'normal'
      s.textColor = theme().link
      s.paddingVertical = '5px'
      s.borderLeft = '1px solid ' + theme().border

      const text = n.name
      if (searchKey && text) {
        const keyIndex = text.toLowerCase().indexOf(searchKey.toLowerCase())
        s.htmlText = keyIndex !== -1 ? text.slice(0, keyIndex) + '<mark>' + text.slice(keyIndex, keyIndex + searchKey.length) + '</mark>' + (text.slice(keyIndex + searchKey.length) ?? '') : text
      } else {
        s.text = text
      }
    })
    .whenHovered(s => {
      s.textColor = theme().link100
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
  const ctx = DerTutorContext.self
  const vm = ctx.noteListVM
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
          s.visible = p && p.page > 1
          s.text = '1'
          s.wrap = false
          s.popUp = 'First page'
        })
        .onClick(() => vm.navigator.updateWith({ page: 1 }))

      Btn()
        .react(s => {
          const p = vm.$state.value.page
          s.visible = p && p.page > 2
          s.text = p ? `${p.page - 1}` : ''
          s.wrap = false
          s.popUp = 'Prev page'
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
          s.popUp = 'Next page'
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
          s.popUp = 'Last page'
        })
        .onClick(() => {
          const p = vm.$state.value.page
          p && vm.navigator.updateWith({ page: p.pages })
        })
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
      s.valign = 'center'
      s.halign = 'stretch'
      s.fontSize = theme().fontSizeXS
      s.fontFamily = FontFamily.MONO
      s.valign = 'center'
      s.paddingHorizontal = '20px'
      s.textSelectable = false
    })
    .children(() => {
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
          s.textColor = theme().link + 'bb'
        })

      LinkBtn()
        .react(s => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          s.visible = lang !== undefined && voc !== undefined
          s.text = voc?.name ?? ''
        }).onClick(() => {
          const lang = vm.$state.value.lang
          const voc = vm.$state.value.voc ?? lang?.vocs.find(v => v.id === vm.$state.value.selectedNote?.voc_id)
          lang && voc && vm.navigator.navigateTo({ langCode: lang?.code, vocCode: voc && vm.encodeName(voc.name) })
        })

      spacer()

      NoteMeta()
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
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().fontSizeXS
      s.fontStyle = 'italic'
      s.paddingHorizontal = '10px'
      s.textColor = theme().text
    })
}

const FiltersView = () => {
  return vstack()
    .react(s => {
      s.gap = '0'
      s.paddingHorizontal = '20px'
    })
    .children(() => {
      Title('Filter by level:')
      LevelsBar()

      spacer().react(s => s.height = '20px')

      Title('Filter by tag:')
      TagSelector()

      spacer().react(s => s.height = '20px')

      Title('Filter by text:')
      FilterByText()

      spacer().react(s => s.height = '20px')

      Title('Quick search /:')
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


const FilterByText = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .react(s => {
      s.gap = '0px'
      s.width = '100%'
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
    })
    .children(() => {

      Icon()
        .react(s => {
          s.value = MaterialIcon.filter_list
          s.position = 'absolute'
          s.width = '30px'
          s.textAlign = 'center'
          s.textColor = theme().text50
        })

      TextInput(vm.$searchBuffer)
        .react(s => {
          s.width = '100%'
          s.maxWidth = '300px'
          s.fontSize = theme().fontSizeXS
          s.paddingLeft = '30px'
          s.placeholder = 'Enter text to search'
          s.border = '1px solid ' + theme().border
        })
        .whenFocused(s => {
          s.border = '1px solid ' + theme().red
        })
        .onKeyDown(e => {
          if (e.key === 'Enter') {
            vm.startSearch(vm.$searchBuffer.value)
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
          else if (e.key === 'Escape') {
            document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
          }
        })
        .onFocus(() => {
          document.activeElement instanceof HTMLInputElement && document.activeElement.select()
        })
    })
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

      hstack().react(s => {
        s.width = '100%'
        s.valign = 'center'
        s.gap = '5px'
      }).children(() => {

        Icon()
          .react(s => {
            s.value = MaterialIcon.search
            s.position = 'absolute'
            s.width = '30px'
            s.textAlign = 'center'
            s.textColor = theme().text50
          })

        TextInput(vm.$quickSearchBuffer)
          .observe(vm.$quickSearchFocused)
          .react(s => {
            s.width = '100%'
            s.maxWidth = '300px'
            s.autoFocus = vm.$quickSearchFocused.value
            s.fontSize = theme().fontSizeXS
            s.placeholder = "Enter text to search"
            s.border = '1px solid ' + theme().border
            s.textColor = theme().strong
            s.caretColor = theme().accent
            s.paddingRight = '5px'
            s.paddingLeft = '30px'
          })
          .whenFocused(s => {
            s.textColor = theme().accent
            s.border = '1px solid ' + theme().accent
          })
          .onBlur(() => { vm.$quickSearchFocused.value = false })
          .onFocus(() => {
            vm.$quickSearchFocused.value = true
            document.activeElement instanceof HTMLInputElement && document.activeElement.select()
          })
          .onKeyDown(e => {
            if (e.key === 'Enter') {
              vm.quickSearch(vm.$quickSearchBuffer.value)
              document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
            }
            else if (e.key === 'Escape') {
              document.activeElement instanceof HTMLInputElement && document.activeElement.blur()
              vm.$quickSearchBuffer.value = ''
            }
          })

        IconBtn()
          .observe(vm.$quickSearchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
          .react(s => {
            s.visible = vm.$quickSearchBuffer.value.length > 0
            s.icon = MaterialIcon.close
            s.textColor = theme().appBg
            s.bgColor = theme().text + 'cc'
            s.width = '20px'
            s.height = '20px'
            s.cornerRadius = '20px'
          }).onClick(() => vm.$quickSearchBuffer.value = '')
          .whenHovered(s => s.bgColor = theme().text)
      })

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
          s.textColor = theme().text
          s.width = '100%'
          s.text = vm.$quickSearchResult.value?.text ?? ''
          s.fontSize = theme().fontSize
          s.absolutePathPrefix = globalContext.server.baseUrl
        })
    })
}

const NexPrevNoteNavigator = () => {
  const vm = DerTutorContext.self.noteListVM
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .observe(vm.$selectedNoteIndex, 'affectsChildrenProps')
    .react(s => {
      s.gap = '10px'
      s.width = '100%'
      s.marginHorizontal = '20px'
      s.borderTop = '1px solid' + theme().border
    })
    .children(() => {
      Btn()
        .react(s => {
          const page = vm.$state.value.page
          if (page) {
            const selectedNoteIndex = vm.$selectedNoteIndex.value
            const selectedPageIndex = page.page ?? 0
            s.visible = selectedNoteIndex > 0 || selectedPageIndex > 1
            s.text = selectedNoteIndex > 0 ? page.items[selectedNoteIndex - 1].name : `Page ${selectedPageIndex - 1}`
          } else {
            s.visible = false
          }

          s.icon = MaterialIcon.arrow_back
          s.height = '50px'
        }).onClick(() => {
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
            s.text = selectedNoteIndex < page.items.length - 1 ? page.items[selectedNoteIndex + 1].name : `Page ${selectedPageIndex + 1}`
          } else {
            s.visible = false
          }

          s.icon = MaterialIcon.arrow_forward
          s.revert = true
          s.height = '50px'

        }).onClick(() => {
          vm.moveNext()
        })
    })
}