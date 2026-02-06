import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'
import { FontFamily } from '../controls/Font'
import { ARTICLE_WIDTH } from '../../app/Application'

type THEME_ID = 'dark' | 'dark-qs' | 'light' | 'light-md' | 'light-qs'

export interface GlobalTheme {
  id: THEME_ID
  isLight: boolean
  fontSizeXL: string
  fontSizeL: string
  fontSizeM: string
  fontSize: string
  defFontSize: string
  fontSizeS: string
  fontSizeXS: string
  defFontWeight: FontWeight
  appBg: string
  actionsBg: string
  text: string
  text50: string
  red: string
  green: string
  em: string
  accent: string
  quote: string
  strong: string
  link: string
  link100: string
  black: string
  blue: string
  note: string
  warn: string
  editor: string
  mark: string
  pynk: string
  border: string
  navBarBg: string
  lineInputFocusedBg: string
  articleBg: string
  transparent: string
  h1: string
  header: string
  quickSearchTheme: GlobalTheme
  markdownTheme: GlobalTheme
}

export class ThemeManager {
  readonly lightTheme: GlobalTheme
  readonly darkTheme: GlobalTheme

  readonly $theme: RXObservableValue<GlobalTheme>

  setLightTheme() {
    this.$theme.value = this.lightTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'light')
  }

  setDarkTheme() {
    this.$theme.value = this.darkTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'dark')
  }

  toggleTheme() {
    if (this.$theme.value.isLight)
      this.setDarkTheme()
    else
      this.setLightTheme()
  }

  constructor() {
    this.lightTheme = this.createLightTheme()
    this.darkTheme = this.createDarkTheme(this.lightTheme)
    this.$theme = new RXObservableValue(this.darkTheme)

    this.buildThemeSelectors(this.lightTheme)
    this.buildThemeSelectors(this.darkTheme)
    this.buildThemeSelectors(this.lightTheme.quickSearchTheme)
    this.buildThemeSelectors(this.lightTheme.markdownTheme)
    this.buildThemeSelectors(this.darkTheme.quickSearchTheme)
    this.buildThemeSelectors(this.darkTheme.markdownTheme)

    const theme = window.localStorage.getItem('theme') ?? 'dark'
    if (theme === 'light') {
      this.setLightTheme()
    } else {
      this.setDarkTheme()
    }
  }


  /*
  *
  * LIGHT THEME
  *
  * */

  createLightTheme(): GlobalTheme {
    const red = '#e1646f'
    const blue = '#639dde' //4984c8
    const black = '#1f2226' //121416
    const accent = '#dedbc0'  //b8c892 c693c3
    const strong = '#cfd7ea'
    const text = '#a8afc2' //707786
    const res = {
      id: 'light',
      isLight: true,

      fontSizeXL: '1.5rem',
      fontSizeL: '1.1rem',
      fontSizeM: '1.1rem',
      fontSize: '1rem',
      defFontSize: 'inherit',
      fontSizeS: '0.9rem',
      fontSizeXS: '0.7rem',

      defFontWeight: 'normal',

      appBg: black,
      text,
      text50: text + 'bb',
      red,
      green: '#6db5b5',
      h1: strong,
      header: '#cfb280',
      em: accent,
      accent,
      quote: '#82a4b9', //a1a1a1
      strong,

      blue,
      black,
      mark: '#dd7d85',
      link: '#6eacf3',
      link100: '#9dcbff',
      pynk: '#d69bea',
      note: '#6db5b5',
      warn: '#a27988',
      border: '#454e56',
      editor: '#a8afc2', //839295
      actionsBg: '#1c2023',
      navBarBg: '#262a2e', //1c1f22
      articleBg: '#25282d', //1d2125
      lineInputFocusedBg: '#ccCCcc'
    } as GlobalTheme

    res.quickSearchTheme = this.createQuickSearchTheme(res)
    res.markdownTheme = this.createLightMarkdownTheme(res)

    return res
  }

  /*
  *
  * LIGHT MARKDOWN THEME
  *
  * */

  createLightMarkdownTheme(t: GlobalTheme): GlobalTheme {
    const black = '#111111'
    const text = '#111111'
    const red = '#bd4571'
    const header = '#755b54'
    const blue = '#425865'
    const border = black + '40'
    const appBg = '#f0f0f0'
    const green = '#0d6750'
    return Object.assign({}, t, {
      id: 'light-md',
      isLight: true,

      appBg,
      mark: '#a11a44',
      pynk: '#521464',
      border,
      strong: black,
      black,
      text,
      text50: text + 'aa',
      red,
      green,
      h1: black,
      header,
      em: black,
      accent: red,
      quote: '#1f5a72',
      blue,
      link: '#005b90',
      link100: red,
      navBarBg: '#304041',
      actionsBg: '#f0f0f0',
      articleBg: '#eeEEee',
      transparent: '#00000000',
      note: green,
      warn: red
    })
  }

  /*
  *
  * DARK THEME
  *
  * */

  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const red = '#b9777d'
    const blue = '#4984c8' //4984c8
    const black = '#0c0d0f' //121416
    const accent = '#c0caa8'  //b8c892 c693c3
    const strong = '#a3abbe'
    const text = '#787f92' //707786
    const appBg = black
    const res = Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg,
      contentBg: '#111111',
      text,
      text50: text + 'bb',
      red,
      green: '#5b9898',
      h1: '#a9b1c2',
      header: '#b3996d',
      em: accent,
      accent,
      quote: '#b1b1b1', //6a87a0 
      strong,

      blue,
      black,
      mark: '#dd7d85',
      link: '#4573bf',
      link100: '#679aea',
      pynk: '#c693c3',
      note: '#5b9898',
      warn: '#a27988',
      border: '#2d3338',
      editor: '#969dad', //839295
      actionsBg: '#17181c',
      navBarBg: '#141518', //1c1f22
      articleBg: appBg, // '#0f1013', //121416 0c0d0f
    }) as GlobalTheme

    res.quickSearchTheme = this.createQuickSearchTheme(res)
    res.markdownTheme = res

    return res
  }

  /*
  *
  * QUICK_SEARCH_THEME
  *
  * */

  createQuickSearchTheme(t: GlobalTheme): GlobalTheme {
    const text = t.isLight ? '#bbBBbb' : '#888888' //707f8b 
    const accent = t.isLight ? '#e0e0e0' : '#a5a5a5'  //9fa786
    return Object.assign({}, t, {
      id: t.id + '-qs',
      text: text,
      defTextColor: text,
      text50: text + 'bb',
      strong: accent,
      h1: accent,
      fontSizeXL: '0.9rem',
      fontSizeL: '0.8rem',
      fontSizeM: '0.8rem',
      defFontSize: '0.8rem',
      fontSizeS: '0.7rem',
      fontSizeXS: '0.7rem',
      note: '#779685',
    })
  }

  readonly alreadyBuiltTheme: Record<string, boolean> = {}

  buildThemeSelectors(t: GlobalTheme) {
    if (this.alreadyBuiltTheme[t.id]) return
    this.alreadyBuiltTheme[t.id] = true

    const parentSelector = t.id
    const monoFont = 'var(--font-family-mono)'
    const textColor = t.text
    const headerPadingTop = '0px'
    // const textProps: StylableComponentProps = { textColor: '#86b3c7' }
    // buildRule(textProps, theme.id, '*')

    /******************************/
    // header
    /******************************/

    const h1Props: UIComponentProps = {
      //textTransform: 'uppercase',
      fontSize: t.fontSizeXL,
      fontWeight: '500',
      textColor: t.h1,
      paddingTop: headerPadingTop,
      //paddingBottom: '20px'
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: UIComponentProps = {
      fontSize: t.fontSizeL,
      fontWeight: 'bold',
      textColor: t.header,
      paddingTop: headerPadingTop,
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: UIComponentProps = {
      fontSize: t.fontSizeM,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: UIComponentProps = {
      fontSize: t.fontSizeM,
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
      borderBottom: '1px solid ' + t.header
    }
    buildRule(h4Props, parentSelector, 'h4')

    const h5Props: UIComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: 'bold',
      textColor: t.header
    }
    buildRule(h5Props, parentSelector, 'h5')

    const h6Props: UIComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor: t.header
    }
    buildRule(h6Props, parentSelector, 'h6')

    /******************************/
    // div, p, span
    /******************************/

    const globalProps: UIComponentProps = {
      fontFamily: 'inherit',
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor: 'inherit',
    }
    buildRule(globalProps, parentSelector, 'div')
    buildRule(globalProps, parentSelector, 'p')
    buildRule(globalProps, parentSelector, 'span')

    /******************************/
    // strong, b, i
    /******************************/

    const strongProps: UIComponentProps = {
      //fontFamily: '--font-family-article-bi',
      fontSize: 'inherit',
      textColor: t.strong,
      fontWeight: t.id === 'light-md' ? 'bold' : 'inherit',
      fontStyle: 'inherit'
    }

    buildRule(strongProps, parentSelector, 'strong')
    strongProps.width = '100%'
    strongProps.textColor = '#ff0000'
    buildRule(strongProps, parentSelector, 'div.de')
    buildRule(strongProps, parentSelector, 'div.en')

    const boldProps: UIComponentProps = {
      fontSize: 'inherit',
      textColor: 'inherit',
      fontWeight: 'bold'
    }
    buildRule(boldProps, parentSelector, 'b')

    const italicProps: UIComponentProps = {
      fontSize: 'inherit',
      textColor: 'inherit',
      fontWeight: 'inherit',
      fontStyle: 'italic'
    }
    buildRule(italicProps, parentSelector, 'i')

    /******************************/
    // list
    /******************************/

    const listItemProps: UIComponentProps = {
      fontSize: t.defFontSize,
      fontWeight: t.defFontWeight,
      textColor: 'inherit',
      margin: '0px',
      padding: '0px'
    }
    buildRule(listItemProps, parentSelector, 'li')
    buildRule(listItemProps, parentSelector, 'ol')

    const listProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor: 'inherit',
      margin: '0px',
      marginLeft: '20px',
      padding: '0px',
    }
    buildRule(listProps, parentSelector, 'ul')

    /******************************/
    // table
    /******************************/

    const tableProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      textColor: 'inherit',
      fontWeight: t.defFontWeight,
      borderColor: t.border,
    }
    buildRule(tableProps, parentSelector, 'table')

    const tdProps: UIComponentProps = {
      fontSize: 'inherit',
      textColor: 'inherit',
      fontWeight: 'inherit',
      borderColor: t.border,
      padding: '10px'
    }

    buildRule(tdProps, parentSelector, 'th')
    buildRule(tdProps, parentSelector, 'td')

    /******************************/
    // em `
    /******************************/

    const emphasizeProps: UIComponentProps = {
      //bgColor: t.id === 'light-md' ? '#bbd5bfff' : 'undefined',
      textColor: t.em,
      fontStyle: 'normal',
      //bgImage: t.isLight ? 'linear-gradient(#4ed0ad00, #4ed0ad50)' : 'inherit',
      bgColor: t.id === 'light-md' ? '#b24ed050' : 'inherit',
      //paddingVertical: '5px'
    }
    buildRule(emphasizeProps, parentSelector, 'em')

    /******************************/
    // mark
    /******************************/

    const markProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: 'inherit',
      textColor: t.mark,
      bgColor: 'unset'
      //bgImage: t.id === 'light-md' ? `linear-gradient(${t.mark + '00'}, ${t.mark + '50'})` : 'inherit',
    }

    buildRule(markProps, parentSelector, 'mark')

    /******************************/
    // code ``
    /******************************/

    const monoFontProps: UIComponentProps = {
      fontSize: t.fontSizeS,
      fontFamily: monoFont,
      display: 'inline',
      textColor: 'inherit',
      padding: '2px',
      whiteSpace: 'nowrap'
      //padding: '5px'
    }
    buildRule(monoFontProps, parentSelector, 'code')

    /******************************/
    // link
    /******************************/

    const linkProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor: t.link
    }

    buildRule(linkProps, parentSelector, 'a')
    buildRule(linkProps, parentSelector, 'a:link')
    buildRule(linkProps, parentSelector, 'a:visited')
    buildRule(linkProps, parentSelector, 'a:active')
    linkProps.textDecoration = 'underline'
    buildRule(linkProps, parentSelector, 'a', ':hover')

    /******************************/
    // quote
    /******************************/

    const blockquoteProps: UIComponentProps = {
      width: '100%',
      paddingHorizontal: '20px',
      fontSize: 'inherit',
      textColor: t.quote,
      borderLeft: '1px solid ' + t.quote + '88',
    }
    buildRule(blockquoteProps, parentSelector, 'blockquote')

    const blockquoteContentProps: UIComponentProps = {
      width: '100%',
      paddingHorizontal: '20px',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      textColor: 'inherit',
      //fontStyle: 'italic'
    }

    buildRule(blockquoteContentProps, parentSelector, 'blockquote p')
    blockquoteContentProps.fontStyle = 'italic'
    blockquoteContentProps.textAlign = 'right'
    blockquoteContentProps.paddingVertical = '10px'
    buildRule(blockquoteContentProps, parentSelector, 'blockquote footer')

    /******************************/
    // image
    /******************************/

    const imgProps: UIComponentProps = {
      maxWidth: ARTICLE_WIDTH - 80 + 'px',
      //paddingTop: '50px'
    }
    buildRule(imgProps, parentSelector, 'img')
    buildRule(imgProps, parentSelector, 'figure')

    /******************************/
    // audio
    /******************************/

    const audioProps: UIComponentProps = {
      width: '50%',
      height: '35px',
      display: 'block',
    }
    buildRule(audioProps, parentSelector, 'audio')

    const audioControlsProps: UIComponentProps = {
      textColor: t.red,
      bgColor: t.border
    }
    buildRule(audioControlsProps, parentSelector, 'audio::-webkit-media-controls-panel')

    /******************************/
    // figcaption
    /******************************/

    const imgCaptionProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: t.fontSizeXS,
      textColor: t.text50,
      paddingBottom: '5px'
    }
    buildRule(imgCaptionProps, parentSelector, 'figcaption')

    /******************************/
    // stars delim
    /******************************/

    const delimProps: UIComponentProps = {
      width: '100%',
      fontWeight: 'bold',
      paddingVertical: '0px',
      textAlign: 'center'
    }
    buildRule(delimProps, parentSelector, '.md-delim')

    const materialIconProps: UIComponentProps = {
      className: '.md-icon',
      fontFamily: FontFamily.MATERIAL_ICON,
      fontSize: 'inherit',
    }
    buildRule(materialIconProps, parentSelector, '.md-icon')

    /******************************/
    // hr
    /******************************/

    const hrProps: UIComponentProps = {
      width: '100%',
      height: '1px',
      border: '1px solid ' + t.border,
      //marginBottom: '20px',
    }
    buildRule(hrProps, parentSelector, 'hr')

    /******************************/
    // footer
    /******************************/

    const footerProps: UIComponentProps = {
      width: '100%',
      textColor: t.text50,
      fontSize: t.fontSizeXS,
    }
    buildRule(footerProps, parentSelector, 'footer')



    /******************************/
    // ru translation
    /******************************/

    const ruParagraphProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: t.defFontSize,
      textColor: t.text50,
      //fontStyle: t.id === 'light-md' ? 'italic' : 'inherit'
    }
    buildRule(ruParagraphProps, parentSelector, '.md-ru')

    /******************************/
    // alignment
    /******************************/

    const centerAlignmentProps: UIComponentProps = {
      width: '100%',
      textAlign: 'center',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(centerAlignmentProps, parentSelector, 'p.md-center')

    const rightAlginmentProps: UIComponentProps = {
      width: '100%',
      textAlign: 'right',
      fontWeight: 'inherit',
      fontSize: 'inherit',
      textColor: 'inherit'
    }
    buildRule(rightAlginmentProps, parentSelector, 'p.md-right')

    // custom rule
    const centerAllProps: any = {
      width: '100%',
      fontSize: 'inherit',
      flexDirection: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontWeight: 'inherit',
      textColor: 'inherit'
    }
    buildRule(centerAllProps, parentSelector, 'div.center')

    /******************************/
    // poem
    /******************************/

    const poemProps: any = {
      textColor: 'inherit',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: '50px',
      fontSize: t.fontSizeS
    }
    buildRule(poemProps, parentSelector, 'div.poem')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.poem div')

    /******************************/
    // note
    /******************************/

    const noteProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      textColor: t.note,
      paddingHorizontal: '20px',
      borderLeft: '1px solid ' + t.note + '88'
    }
    buildRule(noteProps, parentSelector, '.md-note')

    /******************************/
    // warn
    /******************************/

    const warnProps: UIComponentProps = {
      width: '100%',
      fontSize: t.fontSizeS,
      fontWeight: t.defFontWeight,
      textColor: t.warn,
      paddingHorizontal: '20px',
      paddingVertical: '10px',
      bgColor: t.warn + '10',
      borderColor: t.warn + '20',
      //borderLeft: '1px solid ' + t.warn
    }
    const warnFirstChildProps: UIComponentProps = {
      width: '100%',
      fontSize: t.defFontSize,
      content: '"⚠ "',
      textColor: t.warn,
    }
    buildRule(warnProps, parentSelector, 'p.md-warn')
    buildRule(warnFirstChildProps, parentSelector, 'div.warn div p:first-child::before')
  }
}

export const themeManager = new ThemeManager()
export const theme = () => themeManager.$theme.value
export const lightTheme = () => themeManager.lightTheme
export const darkTheme = () => themeManager.darkTheme