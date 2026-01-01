import { btn, div, h2, hlist, hstack, spacer, vlist, vstack } from "flinker-dom"
import { ILang, IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { Markdown } from "../../controls/Markdown"

const ACTION_TIPS = `
## [icon:lightbulb_outline] Tips
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
  return hstack()
    .react(s => {
      s.height = '100%'
      s.gap = '0px'
    }).children(() => {

      div()
        .react(s => {
          s.gap = '10px'
          s.paddingTop = theme().navBarHeight + 70 + 'px'
          s.width = theme().menuWidth + 'px'
          s.height = window.innerHeight - theme().statusBarHeight + 'px'
          s.borderRight = '1px solid ' + theme().border
        })
        .children(() => {

        })

      vstack()
        .react(s => {
          s.width = '100%'
          s.gap = '0px'
        }).children(() => {

          hlist<ILang>()
            .observe(vm.$langs, 'recreateChildren')
            .observe(vm.$selectedLang, 'affectsChildrenProps')
            .observe(vm.$highlightedLang, 'affectsChildrenProps')
            .items(() => vm.$langs.value)
            .itemRenderer(LangRenderer)
            .itemHash((item: ILang) => item.id + ':' + (item === vm.$selectedLang.value))
            .react(s => {
              s.width = '500px'
              s.maxWidth = theme().menuWidth + 'px'
              s.gap = '0'
            })

          spacer().react(s => s.height = '100px')

          h2()
            .observe(vm.$selectedLang)
            .react(s => {
              s.textColor = theme().text50
              s.text = vm.$selectedLang.value ? 'Select a vocabulary' : 'Select a language'
              s.paddingLeft = '20px'
              s.height = '70px'
            })

          vlist<IVoc>()
            .observe(vm.$selectedLang, 'recreateChildren')
            .observe(vm.$highlightedVoc, 'affectsChildrenProps')
            .items(() => vm.$selectedLang.value?.vocs ?? [])
            .itemRenderer(VocRenderer)
            .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$highlightedVoc.value))
            .react(s => {
              s.fontFamily = FontFamily.MONO
              s.fontSize = theme().smallFontSize
              s.width = '100%'
              s.gap = '0'
            })

          spacer().react(s => s.height = '20px')

          Markdown()
            .react(s => {
              s.className = theme().id
              s.paddingHorizontal = '20px'
              s.mode = 'md'
              s.position = 'absolute'
              s.bottom = theme().statusBarHeight + 20 + 'px'
              s.fontSize = theme().smallFontSize
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
      s.textAlign = 'left'
      s.text = lang.name
      s.textColor = theme().red + 'cc'
      s.bgColor = isHighlighted ? theme().appBg : theme().appBg
      s.borderColor = isHighlighted ? theme().red + 'cc' : theme().appBg
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
      s.paddingRight = '5px'
      s.paddingLeft = '20px'
      s.text = index + 1 + '. ' + voc.name
      s.textColor = isSelected ? theme().accent : theme().accent + 'cc'
      s.borderColor = theme().appBg
    })
    .whenHovered(s => {
      s.textColor = theme().accent
    })
    .whenSelected(s => {
      s.borderColor = theme().accent
    })
    .onClick(() => {
      vm.$highlightedVoc.value = voc
      vm.applySelection()
    })
}