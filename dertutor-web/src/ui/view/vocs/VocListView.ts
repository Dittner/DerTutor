import { btn, hstack, image, p, spacer, span, vlist, vstack } from "flinker-dom"
import { ILang, IVoc } from "../../../domain/DomainModel"
import { FontFamily } from "../../controls/Font"
import { DerTutorContext } from "../../../DerTutorContext"
import { theme } from "../../theme/ThemeManager"
import { Markdown } from "../../controls/Markdown"
import { ThemeSwitcher } from "../../../App"
import { translate } from "../../../app/LocaleManager"
import { Btn, Icon } from "../../controls/Button"
import { MaterialIcon } from "../../icons/MaterialIcon"
import { ViewLayer } from "../../../app/ViewLayer"
import { layout } from "../../../app/Application"
import { VSeparator } from "../../controls/Text"


const ABOUT = `
## Ресурс для изучения немецкого и английского языков
Основной функционал:
\`\`\`ul
+ _Поиск слов;_
+ _Базовая грамматика;_
+ _Статьи, поэзия, упражнения_
\`\`\`

## [icon:emoji_objects] _Tips_
\`\`\`ol
1. Сайт спроектирован таким образом, что перемещение между экранами, поиск слов и навигация по найденным словам можно выполнить, не отрывая рук от клавиатуры.
Для этого используйте:
\`\`\`ul
+ →, ↓, →, ↑ — стрелки для перемещения;
+ _Enter_ — для выбора элемента меню;
+ _ESC_ — для отмены операции (напр. ввода текста);
+ _q_ — для возврата на предыдущий экран.
\`\`\`
1. Выделите слово и нажмите _⌘k_ или _f_ для глобального поиска по всем словарям в пределах выбранного языка.
1. Выделите слово и нажмите / (слэш) для __быстрого поиска__. __Быстрый поиск__ возращает единственный ответ в случае полного совпадения искомого слова со словом в словаре.
При этом искомое слово должно быть в начальной форме (напр. инфинитив для глагола). __Быстрый поиск__ позволяет искать слова, не теряя фокуса от прочтения текста.
1. Чтобы просмотреть весь список доступных на том или ином экране горячих клавиш, нажмите знак вопроса: «?».
\`\`\`

## Markdown
В режиме _Markdown_ вы можете добавить в редактор большой объём текста. Чтение будет более эффективным, если использовать преимущества __быстрого поиска__.
`



export const VocListView = () => {
  const vm = DerTutorContext.self.vmFactory.getVocListVM()
  return vstack()
    .react(s => {
      s.width = '100%'
      s.halign = 'center'
      s.valign = 'top'
      s.paddingTop = layout().navBarHeight + 20 + 'px'
      s.paddingBottom = layout().statusBarHeight + 'px'
      s.bgColor = '#111111'
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

      image()
        .react(s => {
          s.position = 'fixed'
          //s.opacity = '0.75'
          s.top = '0'
          s.maskImage = 'linear-gradient(to right, #00000020, #00000050, #00000020)'
          s.src = 'src/resources/bg.jpg'
          s.width = '100%'
          //s.animate = 'opacity 500ms'

        })
        .onClick(() => vm.quit())

      // hstack()
      //   .react(s => {

      //     //s.visible = !layout().isMobile
      //     s.width = '100%'
      //     //s.position = 'fixed'
      //     //s.paddingHorizontal = layout().paddingHorizontal + 'px'
      //     //s.top = layout().navBarHeight + 'px'
      //     s.halign = 'left'
      //     s.valign = 'top'
      //     //s.height = (window.innerHeight - layout().navBarHeight - layout().statusBarHeight) + 'px'
      //     //s.height = '100vh'
      //     s.bgColor = darkTheme().appBg
      //     s.layer = '-1'
      //   })
      //   .children(() => {



      //     // p().react(s => {
      //     //   s.text = "»Der Mensch ist ein Seil, geknüpft zwischen Tier und Übermensch — ein Seil über einem Abgrunde.«"
      //     //   s.fontSize = '1.8rem'
      //     //   s.fontFamily = FontFamily.PIRULEN
      //     //   s.textColor = '#b9777d'
      //     //   s.width = '100%'
      //     //   s.maxWidth = '700px'
      //     //   s.textAlign = 'center'
      //     //   s.paddingHorizontal = '20px'
      //     //   s.position = 'absolute'
      //     // })
      //   })
      //   .onClick(() => vm.quit())

      hstack().react(s => {
        //s.width = layout().contentWidth + 'px'
        s.paddingHorizontal = layout().paddingHorizontal + 'px'
        s.valign = 'base'
        s.halign = 'left'
        s.textColor = theme().text
      }).children(() => {
        // image()
        //   .react(s => {
        //     s.src = '/src/resources/dertutor.svg'
        //     s.height = '400px'
        //     s.opacity = '0.2'
        //   })

        p()
          .react(s => {
            s.fontSize = '7rem'
            s.fontFamily = FontFamily.GOTHIC
            s.textColor = '#ffFFff88'
            //s.maxWidth = '700px'
            s.textAlign = 'left'
            s.text = 'D'
          }).children(() => {
            span().react(s => {
              s.text = 'D'
              s.fontSize = '15rem'
            })

            span().react(s => {
              s.text = 'er '
              s.marginLeft = '-30px'
            })

            span().react(s => {
              s.text = 'T'
              s.fontSize = '15rem'
            })

            span().react(s => {
              s.text = 'utor'
              s.marginLeft = '-30px'
            })
          })
      })

      Markdown().react(s => {
        //s.position = 'absolute'
        //s.top = '400px'
        s.className = theme().id
        s.mode = 'md'
        s.fontSize = theme().fontSize
        s.fontFamily = FontFamily.APP
        s.textColor = theme().quickSearchTheme.text
        s.width = layout().contentWidth + 'px'
        //s.maxWidth = '700px'
        s.textAlign = 'left'
        s.paddingHorizontal = layout().paddingHorizontal + 'px'
        s.text = ABOUT
        s.layer = '1'
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
          s.position = 'fixed'
          s.left = '0'
          s.top = layout().navBarHeight + 'px'
          s.visible = vm.$selectedLang.value !== undefined
          s.width = layout().isCompact ? layout().contentWidth + 'px' : '500px'
          s.gap = '0px'
          s.bgColor = theme().appBg
          s.blur = '10px'
          s.layer = ViewLayer.MODAL_VIEW_CONTENT
          s.fontFamily = FontFamily.APP
          s.fontSize = theme().fontSizeXS
          s.paddingHorizontal = '30px'
          s.paddingVertical = '20px'
          //s.borderColor = layout.isCompact ? theme().transparent : theme().border
        })
    })
}

const Header = () => {
  const vm = DerTutorContext.self.vmFactory.getVocListVM()
  return hstack()
    .observe(vm.$langs, 'recreateChildren')
    .observe(vm.$selectedLang, 'affectsChildrenProps', 'affectsProps')
    .observe(vm.$highlightedLang, 'affectsChildrenProps')
    .react(s => {
      s.fontFamily = FontFamily.APP
      s.halign = 'left'
      s.valign = 'center'
      s.gap = '20px'
      s.bgColor = vm.$selectedLang.value !== undefined ? theme().navBarBg : 'unset'
      //.borderBottom = '1px solid ' + darkTheme().border
    })
    .children(() => {
      vm.$langs.value.forEach((l, i) => {
        LangRenderer(l)
        if (i < vm.$langs.value.length - 1)
          VSeparator()
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

      VSeparator()

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
      //s.paddingHorizontal = '10px'
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