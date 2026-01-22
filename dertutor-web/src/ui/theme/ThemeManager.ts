import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'
import { FontFamily } from '../controls/Font'

export interface GlobalTheme {
  id: 'dark' | 'light'
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
  blue: string
  info: string
  warn: string
  editor: string
  mark: string
  btn: string
  border: string
  navBarBg: string
  inputFocusedBg: string
  articleBg: string
  transparent: string
  h1: string
  header: string
}

export class ThemeManager {
  private readonly _lightTheme: GlobalTheme
  private readonly _darkTheme: GlobalTheme
  private readonly _darkSmallTheme: GlobalTheme
  private readonly _lightSmallTheme: GlobalTheme

  readonly $theme: RXObservableValue<GlobalTheme>
  readonly $smallTheme: RXObservableValue<GlobalTheme>

  setLightTheme() {
    this.$theme.value = this._lightTheme
    this.$smallTheme.value = this._lightSmallTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'light')
  }

  setDarkTheme() {
    this.$theme.value = this._darkTheme
    this.$smallTheme.value = this._darkSmallTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'dark')
  }

  toggleTheme() {
    if (this.$theme.value.id === 'light')
      this.setDarkTheme()
    else if (this.$theme.value.id === 'dark')
      this.setLightTheme()
  }

  constructor() {
    this._lightTheme = this.createLightTheme()
    this._darkTheme = this.createDarkTheme(this._lightTheme)
    this._lightSmallTheme = this.createSmallTheme(this._lightTheme)
    this._darkSmallTheme = this.createSmallTheme(this._darkTheme)
    this.$theme = new RXObservableValue(this._darkTheme)
    this.$smallTheme = new RXObservableValue(this._darkSmallTheme)

    this.buildThemeSelectors(this._lightTheme)
    this.buildThemeSelectors(this._darkTheme)
    this.buildThemeSelectors(this._lightSmallTheme)
    this.buildThemeSelectors(this._darkSmallTheme)

    const theme = window.localStorage.getItem('theme') ?? 'light'
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
    const black = '#111111'
    const text = '#33393a'
    const white = '#ffFFff'
    const red = '#bd4571'
    const header = '#4185a0'
    const blue = '#425865'
    const border = black + '40'
    const appBg = '#f5f5f5'
    return {
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
      appBg,
      mark: '#a11a44',
      btn: '#4a0078',
      border,
      strong: black,
      text,
      text50: text + '88',
      red,
      green: '#7198a9',
      h1: black,
      header,
      em: black,
      accent: red,
      quote: '#32677c',
      blue,
      link: '#005b90',
      link100: red,
      editor: black,
      navBarBg: appBg,
      actionsBg: '#f0f0f0',
      articleBg: '#ffFFff',
      inputFocusedBg: '#eeEEee',
      transparent: '#00000000',
      info: '#026655',
      warn: '#a56a26',
    }
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
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg,
      contentBg: '#111111',
      text,
      text50: text + 'aa',
      red,
      green: '#5b9898',
      h1: '#a9b1c2',
      header: '#b3996d',
      em: accent,
      accent,
      quote: '#6a87a0', //a1a1a1
      strong,
      
      blue,
      mark: '#dd7d85',
      link: blue,
      link100: '#77b1f4',
      btn: '#c693c3',
      info: '#5b9898',
      warn: '#a27988',
      border: '#2d3338',
      editor: '#969dad', //839295
      actionsBg: '#1c2023',
      navBarBg: appBg, //1c1f22
      articleBg: '#121416', //1d2125
      inputFocusedBg: '#a5a5a5'
    })
  }

  /*
  *
  * DARK THEME SMALL
  *
  * */

  createSmallTheme(t: GlobalTheme): GlobalTheme {
    const text = t.isLight ? t.text : '#888888' //707f8b 
    const accent = '#a5a5a5'  //9fa786
    return Object.assign({}, t, {
      id: t.id + '-small',
      text: text,
      defTextColor: text,
      text50: text + 'aa',
      strong: t.isLight ? t.strong : accent,
      h1: t.isLight ? t.h1 : accent,
      fontSizeXL: '1rem',
      fontSizeL: '0.9rem',
      fontSizeM: '0.9rem',
      defFontSize: '0.8rem',
      fontSizeS: '0.7rem',
      fontSizeXS: '0.7rem',
      info: '#779685',
      isLight: t.isLight,
    })
  }

  buildThemeSelectors(t: GlobalTheme) {
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
      fontWeight: t.isLight ? 'bold' : 'inherit',
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
      //bgColor: t.isLight ? '#bbd5bfff' : 'undefined',
      textColor: t.em,
      fontStyle: 'normal',
      //bgImage: t.isLight ? 'linear-gradient(#4ed0ad00, #4ed0ad50)' : 'inherit',
      bgColor: t.isLight ? '#4ed0ad50' : 'inherit',
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
      //bgImage: t.isLight ? `linear-gradient(${t.mark + '00'}, ${t.mark + '50'})` : 'inherit',
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
      maxWidth: window.innerWidth - 40 + 'px',
      //paddingTop: '50px'
    }
    buildRule(imgProps, parentSelector, 'img')
    buildRule(imgProps, parentSelector, 'figure')

    const imgCaptionProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: t.fontSizeXS,
      textColor: t.text50,
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
    // ru translation
    /******************************/

    const ruParagraphProps: UIComponentProps = {
      fontWeight: 'inherit',
      fontSize: t.defFontSize,
      textColor: t.isLight ? 'inherit' : t.text50,
      fontStyle: t.isLight ? 'italic' : 'inherit'
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
      textColor: t.info,
      paddingHorizontal: '20px',
      borderLeft: '1px solid ' + t.info + '88'
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
      borderLeft: '1px solid ' + t.warn
    }
    const warnFirstChildProps: UIComponentProps = {
      width: '100%',
      fontSize: t.defFontSize,
      content: '"⚠ "',
      textColor: t.warn,
    }
    buildRule(warnProps, parentSelector, 'div.warn')
    buildRule(warnFirstChildProps, parentSelector, 'div.warn div p:first-child::before')
  }
}

export const themeManager = new ThemeManager()
export const theme = () => themeManager.$theme.value
export const smallTheme = () => themeManager.$smallTheme.value