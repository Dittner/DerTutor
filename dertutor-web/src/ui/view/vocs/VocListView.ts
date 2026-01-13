import { btn, div, p, spacer, vlist, vstack } from "flinker-dom"
import { ILang, IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { Markdown } from "../../controls/Markdown"
import { globalContext } from "../../../App"

const ACTION_TIPS = `
## [icon:emoji_objects] Tips
---
\`\`\`ul
+ You can navigate through menu items using arrows: →, ↓, →, ↑
+ To see more shortkeys, press ?
+ To create/edit/delete notes, you must have superuser rights.
\`\`\`
`

export const VocListView = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return div()
      .children(() => {

      vstack()
      .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.paddingHorizontal = '20px'
          s.top = layout.navBarHeight + 'px'
          s.left = layout.leftSideMenuWidth + 'px'
          s.width = layout.contentWidth + 'px'
          s.height = window.innerHeight - layout.navBarHeight - layout.statusBarHeight + 'px'
          s.gap = '0px'
        }).children(() => {

          vstack()
            .react(s => {
              s.gap = '0'
              s.halign = 'center'
              s.width = '100%'
            }).children(() => {
              p()
                .observe(vm.$selectedLang)
                .react(s => {
                  s.position = 'relative'
                  s.textColor = theme().red
                  s.text = 'Select a language'
                  s.marginBottom = '-15px'
                  s.bgColor = theme().appBg
                  s.paddingHorizontal = '20px'
                })

              vlist<ILang>()
                .observe(vm.$langs, 'recreateChildren')
                .observe(vm.$selectedLang, 'affectsChildrenProps')
                .observe(vm.$highlightedLang, 'affectsChildrenProps')
                .items(() => vm.$langs.value)
                .itemRenderer(LangRenderer)
                .itemHash((item: ILang) => item.id + ':' + (item === vm.$selectedLang.value))
                .react(s => {
                  s.fontFamily = FontFamily.APP
                  s.fontSize = theme().fontSizeXS
                  s.width = '100%'
                  s.gap = '0'
                  s.padding = '20px'
                  s.border = '1px solid ' + theme().red
                })
            })


          spacer().react(s => s.height = '50px')

          vstack()
            .observe(vm.$selectedLang)
            .react(s => {
              s.visible = vm.$selectedLang.value !== undefined
              s.gap = '0'
              s.halign = 'center'
              s.width = '100%'
            }).children(() => {
              p()
                .observe(vm.$selectedLang)
                .react(s => {
                  s.position = 'relative'
                  s.textColor = theme().accent
                  s.text = 'Select a vocabulary'
                  s.marginBottom = '-15px'
                  s.bgColor = theme().appBg
                  s.paddingHorizontal = '20px'
                })

              vlist<IVoc>()
                .observe(vm.$selectedLang, 'recreateChildren')
                .observe(vm.$highlightedVoc, 'affectsChildrenProps')
                .items(() => vm.$selectedLang.value?.vocs ?? [])
                .itemRenderer(VocRenderer)
                .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$highlightedVoc.value))
                .react(s => {
                  s.fontFamily = FontFamily.APP
                  s.fontSize = theme().fontSizeXS
                  s.width = '100%'
                  s.gap = '0'
                  s.padding = '20px'
                  s.border = '1px solid ' + theme().accent
                })

            })

          spacer().react(s => s.height = '20px')

          Markdown()
            .react(s => {
              s.className = theme().id
              s.mode = 'md'
              s.position = 'absolute'
              s.bottom = '0px'
              s.fontSize = theme().fontSizeXS
              s.textColor = theme().header
              s.text = ACTION_TIPS.trim()
            })
        })
    })
}

const LangRenderer = (lang: ILang) => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return btn()
    .react(s => {
      const isSelected = vm.$selectedLang.value === lang
      const isHighlighted = vm.$highlightedLang.value === lang
      s.wrap = false
      s.isSelected = isSelected
      s.paddingHorizontal = '20px'
      s.textAlign = 'center'
      s.width = '100%'
      s.text = lang.name
      s.textColor = isHighlighted ? theme().red : theme().text50
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().appBg
      s.bgColor = theme().red
    })
    .onClick(() => {
      vm.$selectedLang.value = undefined
      vm.$highlightedLang.value = lang
      vm.applySelection()
    })
}

const VocRenderer = (voc: IVoc, index: number) => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return btn()
    .react(s => {
      const isSelected = vm.$highlightedVoc.value === voc
      s.wrap = false
      s.isSelected = isSelected
      s.textAlign = 'left'
      s.width = '100%'
      s.text = index + 1 + '. ' + voc.name
      s.textColor = isSelected ? theme().accent : theme().text50
      //s.borderColor = theme().appBg
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().accent
      //s.borderColor = theme().accent
    })
    .onClick(() => {
      vm.$highlightedVoc.value = voc
      vm.applySelection()
    })
}