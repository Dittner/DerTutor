import { btn, div, hlist, hstack, input, p, spacer, span, vlist, vstack } from "flinker-dom"
import { globalContext } from "../../../App"
import { IMediaFile, ITag, IVoc } from "../../../domain/DomainModel"
import { PinkBtn, Btn, Icon, IconBtn, LinkBtn, RedBtn } from "../../controls/Button"
import { FontFamily } from "../../controls/Font"
import { Markdown } from "../../controls/Markdown"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { FileWrapper } from "./EditorVM"
import { TextEditor } from "./TextEditor"
import { TextFormatter } from "./TextFormatter"
import { TextInput } from "../../controls/Input"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { log } from "../../../app/Logger"
import { translate } from "../../../app/LocaleManager"
import { ViewLayer } from "../../../app/ViewLayer"
import { layout } from "../../../app/Application"

export const EditorView = () => {
  log('new EditorView')

  const vm = DerTutorContext.self.vmFactory.getEditorVM()

  const formatter = new TextFormatter()

  return div().children(() => {

    Header()
      .react(s => {
        s.position = 'fixed'
        s.height = layout().navBarHeight + 'px'
        s.width = '100%'
        s.layer = ViewLayer.EDITOR
      })

    TextEditor(formatter)
      .observe(vm.$state)
      .bind(vm.$buffer)
      .react(s => {
        s.visible = vm.$state.value.note !== undefined
        s.position = 'fixed'
        s.left = '20px'
        s.top = layout().navBarHeight + 'px'
        s.width = window.innerWidth / 2 - 20 + 'px'
        s.bgColor = theme().appBg
        s.caretColor = theme().red
        s.textColor = theme().editor
        s.padding = '10px'
        s.fontFamily = FontFamily.MONO
        s.fontSize = '18px'
        s.height = window.innerHeight - layout().statusBarHeight - layout().navBarHeight + 'px'
        s.border = '1px solid ' + theme().border
      })
      .whenFocused(s => {
        s.border = '1px solid #454545'
      })

    vstack()
      .react(s => {
        s.paddingLeft = window.innerWidth / 2 + 20 + 'px'
        s.width = '100%'
        s.paddingRight = '10px'
        s.paddingTop = layout().navBarHeight + 'px'
        s.gap = '20px'
      })
      .children(() => {
        VocSelector()
        ReplacePanel()
        LevelsPanel()
        TagSelector()
        PronunciationPanel()
        MediaFileList()
        PendingUploadResources()

        spacer().react(s => {
          s.width = '100%'
          s.height = '2px'
          s.marginVertical = layout().navBarHeight + 'px'
          s.bgColor = theme().text50
        })

        Markdown()
          .observe(vm.$buffer.pipe().debounce(500).fork())
          .react(s => {
            s.className = theme().id
            s.width = '100%'
            s.fontFamily = FontFamily.ARTICLE
            s.textColor = theme().text
            s.cornerRadius = '5px'
            s.text = vm.$buffer.value
            s.mode = 'md'
            s.fontSize = theme().fontSize
            s.absolutePathPrefix = globalContext.server.baseUrl
            s.paddingHorizontal = '5px'
            s.paddingBottom = layout().statusBarHeight + 15 + 'px'
          })
      })
  })
}

const Panel = (title: string) => {
  return hstack()
    .react(s => {
      s.gap = '10px'
      s.width = '100%'
      s.bgColor = theme().text + '10'
      s.paddingVertical = '5px'
      s.paddingHorizontal = '20px'
      s.cornerRadius = '5px'
      s.minHeight = '70px'
      s.valign = 'center'
      s.halign = 'stretch'
    })
    .children(() => {
      p()
        .react(s => {
          s.fontSize = theme().fontSizeXS
          s.fontFamily = FontFamily.APP
          s.minWidth = '150px'
          s.textColor = theme().text
          s.text = translate(title)
          s.textSelectable = false
        })
    })
}

const LevelsPanel = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Panel('Level:')
    .children(() => {
      hlist<number>()
        .observe(vm.$level, 'affectsChildrenProps')
        .items(() => [1, 2, 3, 4, 5, 6])
        .itemRenderer(LevelRenderer)
        .itemHash((item: number) => item + ':' + (item === vm.$level.value))
        .react(s => {
          s.gap = '20px'
          s.width = '100%'
        })
    })
}
const LevelRenderer = (level: number) => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Btn()
    .react(s => {
      s.isSelected = vm.$level.value === level
      s.padding = '5px'
      s.text = vm.reprLevel(level)
      s.textAlign = 'left'
    })
    .onClick(() => vm.$level.value = vm.$level.value === level ? undefined : level)
}

const TagSelector = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Panel('Tag:')
    .observe(vm.$state, 'recreateChildren')
    .observe(vm.$tagId, 'affectsChildrenProps')
    .children(() => {
      p()
        .react(s => {
          s.width = '100%'
          s.fontFamily = FontFamily.APP
        })
        .children(() => {
          const lang = vm.$state.value.lang
          if (lang) lang.tags.forEach(t => TagRenderer(t))
        })
    })
}

const TagRenderer = (t: ITag) => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Btn()
    .react(s => {
      s.isSelected = vm.$tagId.value === t.id
      s.border = '1px solid ' + theme().text50
      s.paddingHorizontal = '5px'
      s.cornerRadius = '2px'
      s.text = t.name
      s.marginRight = '5px'
      s.paddingVertical = '0px'
    })
    .whenHovered(s => {
      s.textColor = theme().text
      s.border = '1px solid ' + theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().accent
      s.border = '1px solid ' + theme().accent
    })
    .onClick(() => vm.$tagId.value = vm.$tagId.value === t.id ? undefined : t.id)
}

const PronunciationPanel = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Panel('Pronunciation:')
    .children(() => {
      vstack()
        .observe(vm.$audioUrl)
        .react(s => {
          s.visible = vm.$audioUrl.value !== ''
          s.width = '100%'
          s.fontSize = theme().fontSizeXS
          s.fontFamily = FontFamily.APP
          s.popUp = 'Play'
        })
        .children(() => {
          p().react(s => {
            s.textColor = theme().text50
            s.text = 'audio.mp3'
          })

          LinkBtn()
            .observe(vm.$audioUrl)
            .react(s => {
              s.text = vm.$audioUrl.value
            })
            .onClick(() => vm.playAudio())
        })

      PinkBtn()
        .observe(vm.$audioUrl)
        .react(s => {
          s.visible = vm.$audioUrl.value === ''
          s.text = translate('Load Audio')
        })
        .onClick(() => vm.loadAudioLink())

      RedBtn()
        .observe(vm.$audioUrl)
        .react(s => {
          s.visible = vm.$audioUrl.value !== ''
          s.text = translate('Delete')
        })
        .onClick(() => vm.$audioUrl.value = '')
    })
}

const MediaFileList = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return vstack()
    .observe(vm.$mediaFiles, 'affectsProps', 'recreateChildren')
    .react(s => {
      s.visible = vm.$mediaFiles.value.length > 0
      s.gap = '5px'
      s.width = '100%'
    })
    .children(() => {
      vm.$mediaFiles.value.forEach(f => {
        MediaFileView(f)
      })
    })
}

const MediaFileView = (mf: IMediaFile) => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Panel('Media:')
    .children(() => {
      vstack()
        .react(s => {
          s.width = '100%'
          s.fontSize = theme().fontSizeXS
          s.fontFamily = FontFamily.APP
          s.flexGrow = 1
        })
        .children(() => {
          p().react(s => {
            s.textColor = theme().text50
            s.text = mf.name + ' '
          })

          IconBtn()
            .react(s => {
              s.text = mf.url + ''
              s.popUp = translate('Copy link')
              s.revert = true
              s.icon = MaterialIcon.content_copy
              s.fontSize = theme().fontSizeXS
              s.iconSize = theme().fontSizeXS
              s.textColor = theme().link
              s.valign = 'bottom'
            })
            .whenHovered(s => {
              s.textColor = theme().link100
            })
            .onClick(() => globalContext.app.copyTextToClipboard(mf.url))
        })

      RedBtn()
        .react(s => {
          s.text = 'Delete'
        })
        .onClick(() => vm.deleteMediaFile(mf))
    })
}


const PendingUploadResources = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return vstack()
    .react(s => {
      s.gap = '5px'
    }).children(() => {
      PendingUploadFileList()

      const chooser = input()
        //.bind(inputBinding)
        .react(s => {
          s.type = 'file'
          s.visible = false
        })
        .onChange((e: any) => {
          vm.addResource(e.target.files[0])
          log(e)
        })

      hstack()
        .react(s => {
          s.width = '100%'
          s.gap = '20px'
          s.valign = 'center'
        })
        .children(() => {
          PinkBtn()
            .react(s => {
              s.text = translate('Choose a media-file')
            })
            .onClick(() => chooser.dom.click())

          p().observe(vm.$filesPendingUpload)
            .react(s => {
              s.visible = vm.$filesPendingUpload.value.length > 0
              s.fontFamily = FontFamily.APP
              s.textColor = theme().text50
              s.text = '|'
            })

          PinkBtn()
            .observe(vm.$filesPendingUpload)
            .react(s => {
              s.visible = vm.$filesPendingUpload.value.length > 0
              s.text = translate('Upload all')
            })
            .onClick(() => vm.uploadAll())
        })
    })
}

const PendingUploadFileList = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return vstack()
    .observe(vm.$filesPendingUpload, 'affectsProps', 'recreateChildren')
    .react(s => {
      s.visible = vm.$filesPendingUpload.value.length > 0
      s.gap = '5px'
      s.width = '100%'
    })
    .children(() => {
      vm.$filesPendingUpload.value.forEach(w => {
        FileView(w)
      })
    })
}

const FileView = (w: FileWrapper) => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Panel('File:')
    .react(s => {
      s.bgColor = theme().red + '10'
    })
    .children(() => {

      input()
        .bind(w.$name)
        .react(s => {
          s.type = 'text'
          s.width = '100%'
          s.height = '40px'
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.textColor = theme().text
          s.bgColor = undefined
          s.paddingHorizontal = '10px'
          s.autoCorrect = 'off'
          s.autoComplete = 'off'
        })
        .whenFocused(s => {
          s.textColor = theme().accent
          s.bgColor = theme().appBg + 'aa'
        })

      RedBtn()
        .react(s => {
          s.text = translate('Cancel')
        })
        .onClick(() => vm.deletePendingUploadFile(w))
    })
}


const Header = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return hstack()
    .react(s => {
      s.gap = '20px'
      s.paddingHorizontal = '20px'
      s.halign = 'right'
      s.valign = 'center'
      s.bgColor = theme().appBg
    })
    .children(() => {
      PinkBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = translate('Save')
          s.popUp = 'Ctrl + Shift + S'
        })
        .onClick(() => vm.save())

      PinkBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.isDisabled = !vm.$hasChanges.value
          s.text = translate('Discard Changes')
        })
        .onClick(() => vm.discardChanges())

      PinkBtn()
        .observe(vm.$hasChanges)
        .react(s => {
          s.visible = vm.$state.value.lang?.code === 'en'
          s.text = 'Load default translation'
        })
        .onClick(() => vm.loadTranslation())

      PinkBtn()
        .react(s => {
          s.text = translate('Quit')
          s.popUp = 'ESC'
        })
        .onClick(() => vm.quit())
    })
}

const ReplacePanel = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return Panel('Replace:')
    .children(() => {
      TextInput(vm.textReplacer.$replaceFrom).react(s => {
        s.placeholder = 'From:'
        s.paddingHorizontal = '10px'
        s.textColor = theme().accent
      })

      TextInput(vm.textReplacer.$replaceTo).react(s => {
        s.placeholder = 'To:'
        s.paddingHorizontal = '10px'
        s.textColor = theme().accent
      })

      spacer()

      PinkBtn()
        .observe(vm.textReplacer.$replaceFrom.pipe().map(value => value.length > 0).removeDuplicates().fork())
        .react(s => {
          s.isDisabled = vm.textReplacer.$replaceFrom.value.length === 0
          s.text = translate('Replace all')
        })
        .onClick(() => vm.replaceAll(vm.textReplacer.$replaceFrom.value, vm.textReplacer.$replaceTo.value))
    })
}

const VocSelector = () => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  const dropdownId = 'EditorView.VocSelector'
  return Panel('Vocabulary:')
    .children(() => {
      spacer()

      vstack()
        .react(s => {
          s.width = '400px'
          s.halign = 'right'
        }).children(() => {
          Btn()
            .observe(vm.$state)
            .observe(vm.$selectedVocId)
            .react(s => {
              const selectedVoc = vm.$state.value.lang?.vocs.find(v => v.id === vm.$selectedVocId.value)
              s.isSelected = selectedVoc !== undefined
            })
            .children(() => {
              span()
                .observe(vm.$state)
                .observe(vm.$selectedVocId)
                .react(s => {
                  const selectedVoc = vm.$state.value.lang?.vocs.find(v => v.id === vm.$selectedVocId.value)
                  s.text = selectedVoc ? selectedVoc.name : 'Voc not found'
                })

              Icon()
                .observe(globalContext.app.$dropdownState, 'affectsProps')
                .react(s => {
                  s.fontSize = theme().fontSize
                  s.value = globalContext.app.$dropdownState.value === dropdownId ? MaterialIcon.arrow_drop_down : MaterialIcon.arrow_right
                })
            })
            .onClick(e => {
              e.stopImmediatePropagation()
              globalContext.app.$dropdownState.value = dropdownId
            })

          vlist<IVoc>()
            .observe(globalContext.app.$dropdownState)
            .observe(vm.$selectedVocId, 'recreateChildren')
            .observe(vm.$state, 'affectsChildrenProps')
            .items(() => vm.$state.value.lang?.vocs ?? [])
            .itemRenderer(VocRenderer)
            .itemHash((item: IVoc) => item.id + item.name + ':' + (item.id === vm.$selectedVocId.value))
            .react(s => {
              s.visible = globalContext.app.$dropdownState.value === dropdownId
              s.fontFamily = FontFamily.APP
              s.fontSize = theme().fontSizeXS
              s.padding = '20px'
              s.width = '250px'
              s.marginTop = '30px'
              s.gap = '0'
              s.bgColor = theme().articleBg
              s.border = '1px solid ' + theme().border
              s.position = 'absolute'
              s.cornerRadius = '4px'
              s.layer = ViewLayer.MODAL_VIEW_CONTENT
            })
        })
    })
}

const VocRenderer = (voc: IVoc) => {
  const vm = DerTutorContext.self.vmFactory.getEditorVM()
  return btn()
    .react(s => {
      s.wrap = false
      s.fontSize = theme().fontSizeXS
      s.isSelected = vm.$selectedVocId.value === voc.id
      s.text = voc.name
      s.width = '100%'
      s.textAlign = 'left'
      s.textColor = theme().text50
      s.paddingVertical = '5px'
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().strong
    })
    .onClick(() => {
      vm.$selectedVocId.value = voc.id
      globalContext.app.$dropdownState.value = ''
    })
}