import { hstack, p, spacer, span, vstack } from "flinker-dom"
import { FontFamily } from "./Font"
import { Btn, Icon, IconBtn } from "./Button"
import { RXObservableValue } from "flinker"
import { DomainService, INote } from "../../domain/DomainModel"
import { MaterialIcon } from "../icons/MaterialIcon"
import { globalContext } from "../../App"
import { Markdown } from "./Markdown"
import { theme } from "../theme/ThemeManager"
import { TextInput } from "./Input"
import { translate } from "../../app/LocaleManager"
import { log } from "../../app/Logger"
import { SearchByNameSchema } from "../../backend/Schema"
import { KeyboardKey } from "./Text"
import { layout } from "../../app/Application"
import { GlobalContext } from "../../app/GlobalContext"

const LANG_ID_KEY = 'QUICK_SEARCH_CONTROLLER:LANG_ID_KEY'

export class QuickSearchController {
  readonly $quickSearchBuffer = new RXObservableValue('')
  readonly $quickSearchFocused = new RXObservableValue(false)
  readonly $quickSearchResult = new RXObservableValue<INote | undefined>(undefined)
  readonly $langId = new RXObservableValue(1)
  readonly $msg = new RXObservableValue('')
  readonly showLangSwitcher: boolean
  private readonly ctx: GlobalContext

  constructor(showLangSwitcher: boolean = false) {
    this.ctx = globalContext
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
        globalContext.$msg.value = { level: 'error', text: e.message }
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

  edit() {
    if (!this.ctx.$user.value) {
      this.ctx.$msg.value = { text: 'User not authorized', level: 'warning' }
      return
    }

    if (!this.ctx.$user.value.is_superuser) {
      this.ctx.$msg.value = { text: 'You do not have permission to edit any note', level: 'warning' }
      return
    }

    const note = this.$quickSearchResult.value
    if (note) {
      const keys = DomainService.noteToUrlKeys(note, this.ctx.$allLangs.value)
      if (keys) {
        this.ctx.navigator.navigateTo({ ...keys, edit: true })
      }
    }
  }
}

export const QuickSearchPanel = (controller: QuickSearchController) => {
  return vstack()
    .react(s => {
      s.width = '100%'
      s.border = '10px solid ' + theme().quickSearchTheme.text + '22'
    })
    .children(() => {

      QuickSearchInput(controller)

      vstack()
        .react(s => {
          s.fontFamily = FontFamily.APP
          s.gap = '0px'
          s.paddingHorizontal = '20px'
        })
        .children(() => {


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

          hstack()
            .observe(controller.$quickSearchResult)
            .react(s => {
              s.visible = controller.$quickSearchResult.value !== undefined
              s.width = '100%'
              s.valign = 'center'
              s.gap = '10px'
              s.paddingVertical = '5px'
            })
            .children(() => {
              Btn()
                .observe(controller.$quickSearchResult)
                .react(s => {
                  const audioUrl = controller.$quickSearchResult.value?.audio_url ?? ''
                  s.mouseEnabled = audioUrl !== ''
                  s.icon = MaterialIcon.volume_up
                  s.visible = audioUrl !== ''
                })
                .onClick(() => controller.playAudio())

              span()
                .observe(controller.$quickSearchResult)
                .react(s => {
                  const level = controller.$quickSearchResult.value?.level ?? 0
                  s.mouseEnabled = level !== 0
                  s.visible = level !== 0
                  s.text = globalContext.vmFactory.getNoteListVM().reprLevel(level)
                  s.textColor = theme().text
                  s.wrap = false
                  s.whiteSpace = 'nowrap'
                  s.fontSize = theme().fontSizeXS
                  s.fontFamily = FontFamily.ARTICLE
                  s.bgColor = theme().text + '10'
                  s.borderColor = theme().text + '20'
                  s.cornerRadius = '4px'
                  s.paddingHorizontal = '4px'
                })

              spacer()

              Btn()
                .observe(controller.$quickSearchResult)
                .react(s => {
                  s.icon = MaterialIcon.edit
                  s.text = 'Edit'
                  s.fontSize = theme().fontSizeXS
                  s.iconSize = theme().fontSizeXS
                })
                .onClick(() => controller.edit())
            })

          Markdown()
            .observe(controller.$quickSearchResult)
            .react(s => {
              s.visible = controller.$quickSearchResult.value !== undefined && controller.$quickSearchResult.value.text.length > 0
              s.className = theme().quickSearchTheme.id
              s.lineHeight = '1.4'
              s.mode = 'md'
              s.fontFamily = FontFamily.ARTICLE
              s.fontSize = '0.8rem'
              s.textColor = theme().quickSearchTheme.text
              s.width = '100%'
              s.text = controller.$quickSearchResult.value?.text ?? ''
              s.absolutePathPrefix = globalContext.server.baseUrl
              s.paddingBottom = '20px'
            })
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
      s.height = layout().navBarHeight + 'px'
      //s.bgColor = controller.$quickSearchFocused.value ? theme().lineInputFocusedBg : theme().transparent
      s.borderBottom = '1px solid ' + theme().border
      s.paddingHorizontal = '20px'
    })
    .children(() => {

      Icon()
        .react(s => {
          s.value = MaterialIcon.search
          s.textAlign = 'center'
          s.textColor = theme().text50
        })

      TextInput(controller.$quickSearchBuffer)
        .observe(controller.$quickSearchFocused)
        .react(s => {
          s.width = '100%'
          s.autoFocus = controller.$quickSearchFocused.value
          s.fontSize = theme().fontSizeS
          s.placeholder = translate('Enter a word to search')
          s.border = 'unset'
          s.textColor = theme().text
          s.caretColor = theme().text
        })
        .whenFocused(s => {
          s.textColor = theme().text100
        })
        .whenPlaceholderShown(s => {
          s.textColor = theme().text50
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

      IconBtn()
        .observe(controller.$quickSearchBuffer.pipe().map(v => v.length > 0).removeDuplicates().fork())
        .react(s => {
          s.visible = controller.$quickSearchBuffer.value.length > 0
          s.icon = MaterialIcon.close
          s.iconSize = theme().fontSizeXS
          s.textColor = theme().appBg
          s.bgColor = theme().text
          s.width = '15px'
          s.height = '15px'
          s.cornerRadius = '15px'
        })
        .whenHovered(s => {
          s.bgColor = theme().text50
        })
        .onClick(() => {
          controller.clear()
        })

      KeyboardKey('/')
    })
}

