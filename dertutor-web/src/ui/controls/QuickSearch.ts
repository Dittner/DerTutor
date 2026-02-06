import { btn, hstack, p, spacer, vstack } from "flinker-dom"
import { FontFamily } from "./Font"
import { Btn, Icon, IconBtn } from "./Button"
import { RXObservableValue } from "flinker"
import { INote, LangId } from "../../domain/DomainModel"
import { MaterialIcon } from "../icons/MaterialIcon"
import { globalContext } from "../../App"
import { Markdown } from "./Markdown"
import { theme } from "../theme/ThemeManager"
import { TextInput } from "./Input"
import { translate } from "../../app/LocaleManager"
import { DerTutorContext } from "../../DerTutorContext"
import { log } from "../../app/Logger"
import { SearchByNameSchema } from "../../backend/Schema"
import { KeyboardKey, Title } from "./Text"

const LANG_ID_KEY = 'QUICK_SEARCH_CONTROLLER:LANG_ID_KEY'

export class QuickSearchController {
  readonly $quickSearchBuffer = new RXObservableValue('')
  readonly $quickSearchFocused = new RXObservableValue(false)
  readonly $quickSearchResult = new RXObservableValue<INote | undefined>(undefined)
  readonly $langId = new RXObservableValue(1)
  readonly $msg = new RXObservableValue('')
  readonly showLangSwitcher: boolean
  private ctx: DerTutorContext

  constructor(ctx: DerTutorContext, showLangSwitcher: boolean = false) {
    this.ctx = ctx
    this.showLangSwitcher = showLangSwitcher

    this.$langId.value = globalContext.localStorage.read(LANG_ID_KEY) ?? 1
    this.$langId.pipe()
      .skipFirst()
      .onReceive(value => {
        globalContext.localStorage.write(LANG_ID_KEY, value)
      })
      .subscribe()
  }

  focus() {
    const selectedText = window.getSelection()?.toString() ?? ''
    if (selectedText) this.$quickSearchBuffer.value = selectedText
    this.$quickSearchFocused.value = true
  }

  search() {
    const word = this.$quickSearchBuffer.value
    if (!word) {
      this.clear()
      return
    }
    else if (word.length < 2) {
      this.$msg.value = translate('Search text is too short')
      return
    } else if (!this.$langId.value) {
      this.$msg.value = translate('Language not selected')
      return
    }

    this.$quickSearchBuffer.value = word

    log('QuickSearchController.quickSearch by name:', word)
    const scheme = {} as SearchByNameSchema
    scheme.lang_id = this.$langId.value
    scheme.voc_id = scheme.lang_id //the first vocabularies have the same ids as languages
    scheme.name = word

    globalContext.server.searchNoteByName(scheme).pipe()
      .onReceive(notes => {
        log('NoteListVM.quickSearch result:', notes)
        if (notes.length > 0) {
          this.$quickSearchResult.value = notes[0]
          this.$msg.value = ''
          globalContext.app.clearInputFocus()
        } else {
          this.$msg.value = `"${word}" ${translate('not found')}`
          this.$quickSearchResult.value = undefined
        }
      })
      .onError(e => {
        this.ctx.$msg.value = { level: 'error', text: e.message }
        this.$quickSearchResult.value = undefined
      })
  }

  clear() {
    this.$quickSearchBuffer.value = ''
    this.$quickSearchFocused.value = false
    this.$quickSearchResult.value = undefined
    this.$msg.value = ''
    globalContext.app.clearInputFocus()
  }

  playAudio() {
    if (this.$quickSearchResult.value?.audio_url)
      new Audio(globalContext.server.baseUrl + this.$quickSearchResult.value?.audio_url).play()
  }
}

export const QuickSearchPanel = (controller: QuickSearchController) => {
  return vstack()
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.bgColor = theme().text + '08'
      s.borderColor = theme().border
      s.maxWidth = '440px'
      s.padding = '20px'
      s.cornerRadius = '4px'
    })
    .children(() => {

      hstack()
        .react(s => {
          s.width = '100%'
        })
        .children(() => {
          Title('Quick search:')
          spacer()
          LangSwitcher(controller)
            .react(s => s.visible = controller.showLangSwitcher)
        })

      QuickSearchInput(controller)

      p()
        .observe(controller.$quickSearchResult)
        .observe(controller.$msg)
        .react(s => {
          s.visible = controller.$quickSearchResult.value === undefined && controller.$msg.value.length > 0
          s.text = controller.$msg.value
          s.textColor = theme().text50
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.paddingVertical = '50px'
          s.width = '100%'
          s.textAlign = 'center'
        })

      Btn()
        .observe(controller.$quickSearchResult)
        .react(s => {
          const audioUrl = controller.$quickSearchResult.value?.audio_url ?? ''
          s.mouseEnabled = audioUrl !== ''
          s.marginTop = '5px'
          s.icon = MaterialIcon.volume_up
          s.text = 'Audio'
          s.visible = audioUrl !== ''
        })
        .onClick(() => controller.playAudio())

      Markdown()
        .observe(controller.$quickSearchResult)
        .react(s => {
          s.className = theme().quickSearchTheme.id
          s.lineHeight = '1.4'
          s.mode = 'md'
          s.fontFamily = FontFamily.ARTICLE
          s.fontSize = '0.8rem'
          s.textColor = theme().quickSearchTheme.text
          s.width = '100%'
          s.text = controller.$quickSearchResult.value?.text ?? ''
          s.absolutePathPrefix = globalContext.server.baseUrl
        })
    })
}

const QuickSearchInput = (controller: QuickSearchController) => {
  return hstack()
    .observe(controller.$quickSearchFocused)
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.halign = 'stretch'
      s.width = '100%'
      s.gap = '5px'
      s.height = '35px'
      s.border = '1px solid ' + (controller.$quickSearchFocused.value ? theme().accent : theme().border)
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

      TextInput(controller.$quickSearchBuffer)
        .observe(controller.$quickSearchFocused)
        .react(s => {
          s.width = '100%'
          //s.maxWidth = '300px'
          s.autoFocus = controller.$quickSearchFocused.value
          s.fontSize = theme().fontSizeXS
          s.placeholder = translate('Enter a word to search')
          s.border = 'unset'
          s.textColor = theme().text
          s.caretColor = theme().accent
        })
        .whenFocused(s => {
          s.textColor = theme().accent
        })
        .onBlur(() => { controller.$quickSearchFocused.value = false })
        .onFocus(() => {
          controller.$quickSearchFocused.value = true
          document.activeElement instanceof HTMLInputElement && document.activeElement.select()
        })
        .onKeyDown(e => {
          if (e.key === 'Enter') {
            e.stopImmediatePropagation()
            controller.search()
          }
          else if (e.key === 'Escape') {
            globalContext.app.clearInputFocus()
            //controller.clear()
          }
        })

      KeyboardKey('/')
        .observe(controller.$quickSearchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = controller.$quickSearchBuffer.value.length === 0
        })

      IconBtn()
        .observe(controller.$quickSearchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = controller.$quickSearchBuffer.value.length > 0
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
          controller.clear()
        })
    })
}

const LangSwitcher = (controller: QuickSearchController) => {
  return hstack().react(s => {
    s.valign = 'center'
    s.gap = '10px'
    s.fontSize = theme().fontSizeXS
    s.paddingVertical = '2px'
    s.valign = 'center'
  })
    .children(() => {
      btn()
        .observe(controller.$langId)
        .react(s => {
          s.text = 'de'
          s.isSelected = controller.$langId.value === LangId.DE
          s.textColor = theme().text50
          s.fontSize = 'inherit'
        })
        .whenHovered(s => {
          s.textColor = theme().text
        })
        .whenSelected(s => {
          s.textColor = theme().em
        })
        .onClick(() => controller.$langId.value = LangId.DE)

      spacer().react(s => {
        s.width = '1px'
        s.height = '10px'
        s.bgColor = theme().text50
      })

      btn()
        .observe(controller.$langId)
        .react(s => {
          s.text = 'en'
          s.isSelected = controller.$langId.value === LangId.EN
          s.textColor = theme().text50
          s.fontSize = 'inherit'
        })
        .whenHovered(s => {
          s.textColor = theme().text
        })
        .whenSelected(s => {
          s.textColor = theme().em
        })
        .onClick(() => controller.$langId.value = LangId.EN)
    })

}