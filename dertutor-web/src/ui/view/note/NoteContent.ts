import { hstack, p, spacer, span, vstack } from "flinker-dom"
import { PinkBtn, Btn } from "../../controls/Button"
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

const NoteInfo = () => {
  const vm = DerTutorContext.self.vmFactory.getNoteListVM()
  return hstack()
    .react(s => {
      s.width = '100%'
      s.height = layout().navBarHeight + 'px'
      s.valign = 'center'
      s.halign = 'center'
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

      NoteLevelTag()

      spacer()

      p()
        .observe(vm.$noteNummberOfTotal)
        .react(s => {
          s.position = 'absolute'
          s.fontFamily = FontFamily.MONO
          s.fontSize = theme().fontSizeXS
          s.textColor = theme().text50
          s.text = vm.$noteNummberOfTotal.value
          s.textAlign = 'center'
          s.height = layout().navBarHeight + 'px'
          s.lineHeight = layout().navBarHeight + 'px'
        })
    })
}

const NoteLevelTag = () => {
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
      s.halign = 'stretch'
      s.gap = '10px'
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
          s.maxWidth = layout().contentWidth / 2 - layout().paddingHorizontal - 5 + 'px'
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
          s.maxWidth = layout().contentWidth / 2 - layout().paddingHorizontal - 5 + 'px'
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