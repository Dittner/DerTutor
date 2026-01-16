import { btn, div, hstack, image, spacer, vlist, vstack } from "flinker-dom"
import { ILang, IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { Markdown } from "../../controls/Markdown"
import { globalContext, ThemeSwitcher } from "../../../App"

const CONTENT_PADDING = '40px'

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

      image()
        .observe(vm.$highlightedLang)
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.visible = !layout.isCompact
          s.position = 'fixed'
          s.left = layout.isCompact ? '0' : 'unset'
          s.right = !layout.isCompact ? '0' : 'unset'
          s.top = layout.navBarHeight + 'px'
          s.maskImage = 'linear-gradient(to right, #00000000, #000000ff)'
          s.src = vm.$highlightedLang.value?.code === 'de' ? 'src/resources/de.jpg' : 'src/resources/en.jpg'
          //s.layer = '100'
          s.height = window.innerHeight - layout.navBarHeight - layout.statusBarHeight + 'px'
        })

      Header()
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.top = '0'
          s.width = '100%'
          s.height = layout.navBarHeight + 'px'
          s.layer = '10'
          s.paddingRight = '20px'
        })

      vstack()
        .observe(globalContext.app.$layout)
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.left = '0'
          s.top = layout.navBarHeight + 20 + 'px'
          s.width = layout.contentWidth + 'px'
          s.height = window.innerHeight - layout.navBarHeight - layout.statusBarHeight + 'px'
          s.paddingBottom = layout.statusBarHeight + 'px'
          s.gap = '0px'
        }).children(() => {

          vlist<IVoc>()
            .observe(vm.$selectedLang)
            .observe(vm.$selectedLang, 'recreateChildren')
            .observe(vm.$highlightedVoc, 'affectsChildrenProps')
            .items(() => vm.$selectedLang.value?.vocs ?? [])
            .itemRenderer(VocRenderer)
            .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$highlightedVoc.value))
            .react(s => {
              s.visible = vm.$selectedLang.value !== undefined
              s.fontFamily = FontFamily.APP
              s.fontSize = theme().fontSizeXS
              s.width = '100%'
              s.gap = '0'
              s.paddingHorizontal = CONTENT_PADDING
            })

          spacer().react(s => s.minHeight = '20px')

          Markdown()
            .react(s => {
              s.className = theme().id
              s.mode = 'md'
              s.fontSize = theme().fontSizeXS
              s.textColor = theme().header
              s.text = ACTION_TIPS.trim()
              s.paddingHorizontal = CONTENT_PADDING
            })
        })
    })
}



const Header = () => {
  const vm = DerTutorContext.self.vocListVM
  return hstack()
    .observe(vm.$langs, 'recreateChildren')
    .observe(vm.$selectedLang, 'affectsChildrenProps')
    .observe(vm.$highlightedLang, 'affectsChildrenProps')
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.valign = 'center'
      s.border = '1px solid ' + theme().border
      s.valign = 'center'
      s.gap = '0'
    })
    .children(() => {

      vm.$langs.value.forEach((l, i) => {
        LangRenderer(l)
        if (i < vm.$langs.value.length - 1)
          spacer().react(s => {
            s.width = '1px'
            s.height = '20px'
            s.bgColor = theme().border
          })
      })

      spacer()

      ThemeSwitcher()
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
      s.textAlign = 'left'
      s.paddingVertical = '10px'
      s.paddingHorizontal = CONTENT_PADDING
      s.text = lang.name
      s.height = '100%'
      s.textColor = isHighlighted ? theme().red : theme().text50
      s.borderBottom = '2px solid ' + theme().transparent
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().red
      s.borderBottom = '2px solid ' + theme().red
    })
    .onClick(() => {
      vm.$selectedLang.value = lang
      vm.$highlightedLang.value = lang
      vm.$highlightedVoc.value = undefined
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
      s.paddingVertical = '5px'
      s.text = index + 1 + '. ' + voc.name
      s.textColor = isSelected ? theme().accent : theme().text
      //s.borderColor = theme().appBg
    })
    .whenHovered(s => {
      s.textColor = theme().strong
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