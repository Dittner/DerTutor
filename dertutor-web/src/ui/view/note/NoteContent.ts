import { hstack, p, spacer, span, vstack } from "flinker-dom"
import { PinkBtn, Btn, IconBtn, LinkBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { globalContext } from "../../../App"
import { Markdown } from "../../controls/Markdown"
import { DerTutorContext } from "../../../DerTutorContext"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { theme } from "../../theme/ThemeManager"
import { translate } from "../../../app/LocaleManager"
import { layout, MARKDOWN_MAX_WIDTH } from "../../../app/Application"

export const NoteContentView = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return vstack()
    .observe(vm.$state, 'affectsChildrenProps', 'affectsProps')
    .react(s => {
      s.visible = vm.$state.value.selectedNote !== undefined
      s.bgColor = theme().articleBg
      s.halign = 'left'
    })
    .children(() => {

      NavBar()

      NoteInfo()

      Markdown()
        .observe(vm.$taskAnswerShown)
        .react(s => {
          const searchKey = vm.$state.value.searchKey ?? ''
          const text = vm.$state.value.selectedNote?.text ?? ''
          s.className = theme().id
          s.mode = 'md'
          s.fontFamily = FontFamily.ARTICLE
          s.textColor = theme().text
          s.width = '100%'
          s.maxWidth = MARKDOWN_MAX_WIDTH + 'px'
          s.mark = searchKey.length > 1 ? searchKey : ''
          s.text = text.replace(/(\?\?([^?]+)\?\?)/g, vm.$taskAnswerShown.value ? '$2' : '\\_\\_\\_')
          s.fontSize = theme().fontSize
          s.absolutePathPrefix = globalContext.server.baseUrl
        })

      spacer().react(s => s.height = '40px')

      PinkBtn()
        .observe(vm.$taskAnswerShown)
        .react(s => {
          const note = vm.$state.value.selectedNote
          s.visible = note && vm.$taskAnswerShown.value === false && note.text.includes('??')
          s.text = translate('Show answer')
          s.popUp = 'Enter'
          s.textColor = theme().pynk + 'cc'
        })
        .whenHovered(s => s.textColor = theme().pynk)
        .onClick(() => vm.$taskAnswerShown.value = true)

      spacer()

      NextPrevNoteNavigator()
    })
}

const NavBar = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .react(s => {
      s.width = '100%'
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
        .whenHovered(s => {
          s.textColor = theme().text
        })
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
          s.textColor = theme().link
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

const NoteInfo = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return hstack()
    .react(s => {
      s.width = '100%'
      s.height = layout().navBarHeight + 'px'
      s.valign = 'center'
      s.halign = 'stretch'
      s.gap = '10px'
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
        .onClick(() => vm.playAudio())

      NoteAudioLevelTag()

      spacer()

      p()
        .observe(vm.$noteNummberOfTotal)
        .react(s => {
          s.position = 'absolute'
          s.left = '0'
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().fontSizeXS
          s.textColor = theme().text50
          s.text = vm.$noteNummberOfTotal.value
          s.textAlign = 'center'
          s.height = layout().navBarHeight + 'px'
          s.lineHeight = layout().navBarHeight + 'px'
          s.width = '100%'
        })
    })
}

const NoteAudioLevelTag = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return p()
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.textColor = theme().text50
      s.whiteSpace = 'nowrap'
    })
    .children(() => {
      span()
        .observe(vm.$state)
        .react(s => {
          const note = vm.$state.value.selectedNote
          const level = note ? vm.reprLevel(note.level) : ''
          s.visible = level !== ''
          s.text = level
          s.bgColor = theme().text + '10'
          s.borderColor = theme().text + '20'
          s.cornerRadius = '4px'
          s.paddingHorizontal = '6px'
        })

      span()
        .observe(vm.$state)
        .react(s => {
          const note = vm.$state.value.selectedNote
          const tag = vm.reprTag(note?.tag_id)
          s.visible = tag !== ''
          s.text = tag
          s.marginLeft = '5px'
          s.bgColor = theme().text + '10'
          s.borderColor = theme().text + '20'
          s.cornerRadius = '4px'
          s.paddingHorizontal = '4px'
        })
    })
}



const NextPrevNoteNavigator = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return hstack()
    .observe(vm.$state, 'affectsChildrenProps')
    .observe(vm.$selectedNoteIndex, 'affectsChildrenProps')
    .react(s => {
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
          s.textColor = theme().text + '88'
        })
        .whenHovered(s => {
          s.textColor = theme().link
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
          s.textColor = theme().text + '88'
        })
        .whenHovered(s => {
          s.textColor = theme().link
        })
        .onClick(() => {
          vm.moveNext()
        })
    })
}