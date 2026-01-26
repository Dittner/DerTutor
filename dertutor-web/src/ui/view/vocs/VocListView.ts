import { btn, hstack, image, p, spacer, span, vlist, vstack } from "flinker-dom"
import { ILang, IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { darkTheme, theme } from "../../theme/ThemeManager"
import { Markdown } from "../../controls/Markdown"
import { globalContext, ThemeSwitcher } from "../../../App"
import { localeManager, translate } from "../../../app/LocaleManager"
import { Icon, IconBtn } from "../../controls/Button"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { ViewLayer } from "../../../app/ViewLayer"


const EN_ACTION_TIPS = `
## [icon:emoji_objects] Tips
\`\`\`ul
+ You can navigate through menu items using arrows: →, ↓, →, ↑
+ To see more shortcuts, press: ?
+ To create/edit/delete notes, you must log in as superuser...
\`\`\`
`

const DE_ACTION_TIPS = `
## [icon:emoji_objects] Tipps
\`\`\`ul
+ Sie können mithilfe der Pfeilzeichen durch die Menüpunkte navigieren: →, ↓, →, ↑
+ Um weitere Tastenkombinationen anzuzeigen, drücken Sie: ?
+ Zum Erstellen/Bearbeiten/Löschen von Notizen müssen Sie sich als Superuser anmelden.
\`\`\`
`

export const VocListView = () => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return vstack()
    .observe(globalContext.app.$layout, 'affectsChildrenProps')
    .react(s => {
      const layout = globalContext.app.$layout.value
      s.width = '100%'
      s.halign = 'left'
      s.valign = 'top'
      s.paddingTop = layout.navBarHeight + 'px'
      s.paddingBottom = layout.statusBarHeight + 'px'
      s.paddingHorizontal = '20px'
    })
    .children(() => {
      Header()
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.top = '0'
          s.left = '0'
          s.width = '100%'
          s.height = layout.navBarHeight + 'px'
          s.layer = ViewLayer.HEADER
          s.paddingHorizontal = '20px'
        })

      hstack()
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.visible = !layout.isCompact
          s.width = '100%'
          s.position = 'fixed'
          s.left = '0'
          s.top = layout.navBarHeight + 'px'
          s.halign = 'center'
          s.valign = 'top'
          s.height = (window.innerHeight - layout.navBarHeight - layout.statusBarHeight) + 'px'
          s.bgColor = darkTheme().appBg
        })
        .children(() => {
          //de
          image()
            .observe(vm.$highlightedLang)
            .react(s => {
              s.maskImage = 'linear-gradient(to right, #00000000, #000000ff, #00000000)'
              s.src = 'src/resources/de.jpg'
              s.height = '100%'
              s.position = 'absolute'
              s.opacity = vm.$highlightedLang.value?.code === 'de' ? '1' : '0'
              s.maxHeight = '674px'
              s.animate = 'opacity 500ms'
            })

          //en
          image()
            .observe(vm.$highlightedLang)
            .react(s => {
              s.maskImage = 'linear-gradient(to right, #00000000, #000000ff, #00000000)'
              s.src = 'src/resources/en.jpg'
              s.height = '100%'
              s.position = 'absolute'
              s.opacity = vm.$highlightedLang.value?.code === 'en' ? '1' : '0'
              s.maxHeight = '674px'
              s.animate = 'opacity 500ms'
            })
        }).onClick(() => vm.quit())



      vlist<IVoc>()
        .observe(vm.$selectedLang)
        .observe(vm.$selectedLang, 'recreateChildren')
        .observe(vm.$highlightedVoc, 'affectsChildrenProps')
        .items(() => vm.$selectedLang.value?.vocs ?? [])
        .itemRenderer(VocRenderer)
        .itemHash((item: IVoc) => item.id + item.name + ':' + (item === vm.$highlightedVoc.value))
        .react(s => {
          const layout = globalContext.app.$layout.value
          s.visible = vm.$selectedLang.value !== undefined
          //s.width = layout.isCompact ? '100%' : 0.75 * layout.contentWidth + 'px'
          s.width = 'unset'
          s.gap = '0px'
          s.bgColor = theme().appBg
          s.layer = ViewLayer.MODAL_VIEW_CONTENT
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.paddingHorizontal = '20px'
          s.paddingVertical = '20px'
          s.borderColor = layout.isCompact ? theme().transparent : theme().border
        })


      vstack()
        .observe(vm.$showTips)
        .react(s => {
          s.visible = vm.$showTips.value
          const layout = globalContext.app.$layout.value
          s.position = 'fixed'
          s.right = '20px'
          s.width = 'unset'
          s.bottom = layout.statusBarHeight + 'px'
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
  const vm = DerTutorContext.self.vocListVM
  return hstack()
    .observe(vm.$langs, 'recreateChildren')
    .observe(vm.$selectedLang, 'affectsChildrenProps')
    .observe(vm.$highlightedLang, 'affectsChildrenProps')
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.halign = 'left'
      s.valign = 'center'
      s.gap = '20px'
      s.borderBottom = '1px solid ' + darkTheme().border
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

      UserAuthStatus()

      ThemeSwitcher()
    })
}


const UserAuthStatus = () => {
  const ctx = DerTutorContext.self

  return p()
    .observe(globalContext.app.$layout)
    .observe(ctx.$user)
    .react(s => {
      const layout = globalContext.app.$layout.value
      s.position = 'fixed'
      s.top = '0px'
      s.right = '120px'
      s.height = layout.navBarHeight + 'px'
      s.lineHeight = layout.navBarHeight + 'px'
      s.visible = !layout.isCompact
      s.fontFamily = FontFamily.MONO
      s.fontSize = theme().fontSizeXS
      s.textColor = '#604d92'
      s.layer = ViewLayer.HEADER
      if (!ctx.$user.value)
        s.text = ''
      else
        s.text = ctx.$user.value.username + (ctx.$user.value.is_superuser ? ':superuser' : '')
    })
}

const LangRenderer = (lang: ILang) => {
  const ctx = DerTutorContext.self
  const vm = ctx.vocListVM
  return hstack()
    .react(s => {
      const isSelected = vm.$selectedLang.value === lang
      const isHighlighted = vm.$highlightedLang.value === lang
      s.fontFamily = FontFamily.APP
      s.fontSize = darkTheme().fontSize
      s.textColor = isSelected || isHighlighted ? darkTheme().mark : darkTheme().text50
      //s.bgColor = isSelected ? darkTheme().header : darkTheme().transparent
      s.textSelectable = false
      s.paddingHorizontal = '20px'
      s.paddingVertical = '5px'
      s.valign = 'center'
      s.halign = 'center'
      s.cornerRadius = '10px'
      s.gap = '10px'
    })
    .whenHovered(s => {
      s.bgColor = darkTheme().text + '20'
      s.cursor = 'pointer'
    })
    .onClick(() => {
      vm.$selectedLang.value = lang
      vm.$highlightedLang.value = lang
      vm.$highlightedVoc.value = undefined
      vm.applySelection()
    }).children(() => {
      image()
        .react(s => {
          s.src = lang.code === 'de' ? '/src/resources/de_flag.svg' : '/src/resources/en_flag.svg'
          s.width = '18px'
          s.height = '18px'
          s.cornerRadius = '18px'
        })

      span().react(s => {
        s.text = lang.name
      })

      Icon().react(s => {
        const isSelected = vm.$selectedLang.value === lang
        const isHighlighted = vm.$highlightedLang.value === lang

        s.value = isSelected ? MaterialIcon.keyboard_arrow_down : MaterialIcon.keyboard_arrow_right
        s.fontSize = darkTheme().fontSizeL
        s.textColor = isSelected || isHighlighted ? darkTheme().mark : darkTheme().text50
      })
    })
}

const VocRenderer = (voc: IVoc) => {
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
    }).children(() => {
      span().react(s => {
        s.fontFamily = FontFamily.MONO
        s.textColor = theme().text + '60'
        s.fontSize = theme().fontSizeS
        s.text = voc.name.length > 4 ? voc.name.substring(0, 3) : ''
      })

      span().react(s => {
        s.text = voc.name.length > 4 ? voc.name.substring(3) : ''
      })
    })
}