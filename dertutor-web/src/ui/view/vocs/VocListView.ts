import { btn, hstack, image, p, spacer, span, vlist, vstack } from "flinker-dom"
import { ILang, IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { darkTheme, theme } from "../../theme/ThemeManager"
import { Markdown } from "../../controls/Markdown"
import { ThemeSwitcher } from "../../../App"
import { localeManager, translate } from "../../../app/LocaleManager"
import { Btn, Icon, IconBtn } from "../../controls/Button"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { ViewLayer } from "../../../app/ViewLayer"
import { layout } from "../../../app/Application"


const EN_ACTION_TIPS = `
## [icon:emoji_objects] Tips
\`\`\`ul
+ You can navigate through menu items using arrows: →, ↓, →, ↑
+ To see more shortcuts, press: ?
\`\`\`
`

const DE_ACTION_TIPS = `
## [icon:emoji_objects] Tipps
\`\`\`ul
+ Sie können mithilfe der Pfeilzeichen durch die Menüpunkte navigieren: →, ↓, →, ↑
+ Um weitere Tastenkombinationen anzuzeigen, drücken Sie: ?
\`\`\`
`

export const VocListView = () => {
  const vm = DerTutorContext.self.vmFactory.getVocListVM()
  return vstack()
    .react(s => {
      s.width = '100%'
      s.halign = 'left'
      s.valign = 'top'
      s.paddingTop = layout().navBarHeight + 'px'
      s.paddingBottom = layout().statusBarHeight + 'px'
      //s.paddingHorizontal = '20px'
    })
    .children(() => {
      Header()
        .react(s => {
          s.position = 'fixed'
          s.top = '0'
          s.left = '0'
          s.width = '100%'
          s.height = layout().navBarHeight + 'px'
          s.layer = ViewLayer.HEADER
          s.paddingHorizontal = '20px'
        })

      hstack()
        .react(s => {
          s.visible = !layout().isMobile
          s.width = '100%'
          s.position = 'fixed'
          s.top = '0'
          s.left = '0'
          //s.top = layout().navBarHeight + 'px'
          s.halign = 'right'
          s.valign = 'center'
          //s.height = (window.innerHeight - layout().navBarHeight - layout().statusBarHeight) + 'px'
          s.height = '100vh'
          s.bgColor = darkTheme().appBg
        })
        .children(() => {

          image()
            .react(s => {
              //s.maskImage = 'linear-gradient(to right, #00000030, #00000070, #00000030)'
              s.src = 'src/resources/bg.jpg'
              s.width = window.innerHeight < window.innerWidth ? '100%' : 'unset'
              s.height = window.innerHeight < window.innerWidth ? 'unset' : '100%'
              s.position = 'absolute'
              //s.animate = 'opacity 500ms'
            })

          p().react(s => {
            s.text = "»Der Mensch ist ein Seil, geknüpft zwischen Tier und Übermensch — ein Seil über einem Abgrunde.«"
            s.fontSize = '1.8rem' 
            s.fontFamily = FontFamily.PIRULEN
            s.textColor = '#b9777d'
            s.width = '100%'
            s.maxWidth = '700px'
            s.textAlign = 'center'
            s.paddingHorizontal = '20px'
            s.position = 'absolute'
          })
        })
        .onClick(() => vm.quit())

      vlist<IVoc>()
        .observe(vm.$selectedLang)
        .observe(vm.$selectedLang, 'recreateChildren')
        .observe(vm.$highlightedVoc, 'affectsChildrenProps')
        .items(() => vm.$selectedLang.value?.vocs ?? [])
        .itemRenderer(VocRenderer)
        .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$highlightedVoc.value))
        .react(s => {
          s.visible = vm.$selectedLang.value !== undefined
          s.width = layout().isCompact ? layout().contentWidth + 'px' : '500px'
          s.gap = '0px'
          s.bgColor = theme().appBg + 'cc'
          s.blur = '10px'
          s.layer = ViewLayer.MODAL_VIEW_CONTENT
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.paddingHorizontal = '30px'
          s.paddingVertical = '20px'
          //s.borderColor = layout.isCompact ? theme().transparent : theme().border
        })


      vstack()
        .observe(vm.$showTips)
        .react(s => {
          s.visible = vm.$showTips.value
          s.position = 'fixed'
          s.right = '20px'
          s.width = 'unset'
          s.bottom = layout().statusBarHeight + 'px'
          s.halign = 'right'
          s.gap = '2px'
        }).children(() => {

          IconBtn()
            .react(s => {
              s.icon = MaterialIcon.close
              s.text = translate('Close')
              s.gap = '0'
              s.textColor = theme().header + 'cc'
              s.iconSize = theme().fontSizeS
              s.fontSize = theme().fontSizeXS
            })
            .whenHovered(s => {
              s.textColor = theme().header
            })
            .onClick(() => vm.closeTips())

          Markdown()
            .react(s => {
              s.className = theme().id
              s.width = '300px'
              s.mode = 'md'
              s.fontSize = theme().fontSizeXS
              s.textColor = theme().header
              s.text = localeManager.$locale.value === 'de' ? DE_ACTION_TIPS.trim() : EN_ACTION_TIPS.trim()
              s.paddingHorizontal = '20px'
              s.paddingVertical = '10px'
              s.bgColor = theme().header + '20'
              s.borderColor = theme().header + '40'
              s.cornerRadius = '5px'
              s.layer = ViewLayer.MODAL_VIEW
            })
        })
    })
}

const Header = () => {
  const vm = DerTutorContext.self.vmFactory.getVocListVM()
  return hstack()
    .observe(vm.$langs, 'recreateChildren')
    .observe(vm.$selectedLang, 'affectsChildrenProps')
    .observe(vm.$highlightedLang, 'affectsChildrenProps')
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.halign = 'left'
      s.valign = 'center'
      s.gap = '15px'
      s.bgColor = theme().navBarBg
      //.borderBottom = '1px solid ' + darkTheme().border
    })
    .children(() => {
      vm.$langs.value.forEach((l, i) => {
        LangRenderer(l)
        if (i < vm.$langs.value.length - 1)
          spacer().react(s => {
            s.width = '1px'
            s.height = '20px'
            s.bgColor = darkTheme().border
          })
      })

      spacer()

      Btn()
        .react(s => {
          s.visible = !layout().isMobile
          s.text = translate('Markdown')
          s.fontSize = theme().fontSizeS
          s.icon = MaterialIcon.edit
        })
        .onClick(() => vm.navigateToMarkdown())

      ThemeSwitcher()

      UserAuthStatus()
    })
}


const UserAuthStatus = () => {
  const ctx = DerTutorContext.self

  return p()
    .observe(ctx.$user)
    .react(s => {
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.textColor = theme().red
      s.layer = ViewLayer.HEADER
      s.width = '10px'
      s.height = '10px'
      s.cornerRadius = '10px'
      s.bgColor = '#920d58'
      s.popUp = ctx.$user.value ? ctx.$user.value.username + (ctx.$user.value.is_superuser ? ':superuser' : '') : ''
    })
}

const LangRenderer = (lang: ILang) => {
  const vm = DerTutorContext.self.vmFactory.getVocListVM()
  return hstack()
    .react(s => {
      const isSelected = vm.$selectedLang.value === lang
      const isHighlighted = vm.$highlightedLang.value === lang
      s.fontFamily = FontFamily.APP
      s.fontSize = theme().fontSizeS
      s.textColor = isSelected || isHighlighted ? theme().text : theme().text50
      //s.bgColor = isSelected ? darkTheme().header : darkTheme().transparent
      s.textSelectable = false
      s.paddingHorizontal = '10px'
      s.paddingVertical = '5px'
      s.valign = 'center'
      s.halign = 'center'
      s.cornerRadius = '5px'
      s.gap = '8px'
    })
    .whenHovered(s => {
      s.textColor = theme().text
      s.cursor = 'pointer'
    })
    .onClick(() => {
      vm.$selectedLang.value = lang
      vm.$highlightedLang.value = lang
      vm.$highlightedVoc.value = undefined
      vm.applySelection()
    })
    .children(() => {
      image()
        .react(s => {
          s.src = lang.code === 'de' ? '/src/resources/de_flag.svg' : '/src/resources/en_flag.svg'
          s.width = '15px'
          s.height = '15px'
          s.cornerRadius = '15px'
        })

      span().react(s => {
        s.text = lang.name
        s.textColor = 'inherit'
      })

      Icon().react(s => {
        const isSelected = vm.$selectedLang.value === lang
        const isHighlighted = vm.$highlightedLang.value === lang

        s.value = isSelected ? MaterialIcon.keyboard_arrow_down : MaterialIcon.keyboard_arrow_right
        s.fontSize = theme().fontSize
        s.textColor = isSelected || isHighlighted ? theme().text : theme().text50
      })
    })
}

const VocRenderer = (voc: IVoc) => {
  const vm = DerTutorContext.self.vmFactory.getVocListVM()
  return btn()
    .react(s => {
      const isSelected = vm.$highlightedVoc.value === voc
      s.wrap = false
      s.isSelected = isSelected
      s.textAlign = 'left'
      s.width = '100%'
      s.paddingVertical = '5px'
      s.fontSize = theme().fontSizeS
      s.textColor = isSelected ? theme().accent : theme().text50
    })
    .whenHovered(s => {
      s.textColor = theme().text
    })
    .whenSelected(s => {
      s.textColor = theme().strong
      //s.borderColor = theme().accent
    })
    .onClick(() => {
      vm.$highlightedVoc.value = voc
      vm.applySelection()
    })
    .children(() => {
      span().react(s => {
        s.fontFamily = FontFamily.MONO
        s.textColor = theme().text + '60'
        s.text = voc.name.length > 4 ? voc.name.substring(0, 3) : ''
      })

      span().react(s => {
        s.text = voc.name.length > 4 ? voc.name.substring(3) : ''
      })
    })
}