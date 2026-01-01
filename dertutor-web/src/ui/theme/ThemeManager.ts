import { RXObservableValue } from 'flinker'
import { buildRule, FontWeight, UIComponentProps } from 'flinker-dom'
import { FontFamily } from '../controls/Font'

export interface GlobalTheme {
  id: 'dark' | 'light'
  isLight: boolean
  smallFontSize: string
  defFontSize: string
  defFontWeight: FontWeight
  appBg: string
  actionsBg: string
  text: string
  text50: string
  red: string
  green: string
  em: string
  accent: string
  strong: string
  link: string
  blue: string
  info: string
  warn: string
  editor: string
  mark: string
  btn: string
  border: string
  transparent: string
  h1: string
  header: string
  maxNoteViewWidth: number
  menuWidth: number
  statusBarHeight: number
  navBarHeight: number
}

export class ThemeManager {
  private readonly _lightTheme: GlobalTheme
  private readonly _darkTheme: GlobalTheme

  readonly $theme: RXObservableValue<GlobalTheme>

  setLightTheme() {
    this.$theme.value = this._lightTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'light')
  }

  setDarkTheme() {
    this.$theme.value = this._darkTheme
    const html = document.querySelector('html')
    if (html) {
      html.style.colorScheme = 'dark'
      html.style.backgroundColor = this.$theme.value.appBg
    }
    window.localStorage.setItem('theme', 'dark')
  }

  switchTheme() {
    if (this.$theme.value.id === 'light')
      this.setDarkTheme()
    else if (this.$theme.value.id === 'dark')
      this.setLightTheme()
  }

  constructor() {
    this._lightTheme = this.createLightTheme()
    this._darkTheme = this.createDarkTheme(this._lightTheme)
    this.$theme = new RXObservableValue(this._lightTheme)

    this.buildThemeSelectors(this._lightTheme)
    this.buildThemeSelectors(this._darkTheme)

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
    const white = '#f8f8f8'//efeee8
    const red = '#ac2f2f'
    const header = '#755b54'
    const blue = '#3d627d'
    return {
      id: 'light',
      isLight: true,
      smallFontSize: '0.75rem',
      defFontSize: '1rem',
      defFontWeight: '400',
      appBg: white,
      mark: '#efa6ff',
      btn: '#4a0078',
      border: black + '20',
      strong: black,
      text: black,
      text50: black + '88',
      red,
      green: '#7198a9',
      actionsBg: '#f0f0f0',
      h1: black,
      header,
      em: black,
      accent: '#b741d1',
      blue,
      link: '#29177c',
      editor: black,
      transparent: '#00000000',
      info: '#29177c',
      warn: '#a56a26',
      maxNoteViewWidth: 850,
      menuWidth: 400,
      statusBarHeight: 30,
      navBarHeight: 50,
    }
  }

  /*
  *
  * DARK THEME
  *
  * */


  createDarkTheme(t: GlobalTheme): GlobalTheme {
    const text = '#707786' //707f8b 
    const red = '#b9777d'
    const blue = '#498ebf'
    const black = '#18191e'
    const accent = '#b0c8b3'  //9fa786
    return Object.assign({}, t, {
      id: 'dark',
      isLight: false,
      appBg: black,
      text,
      text50: text + 'aa',
      red,
      green: '#5eb3b3',
      h1: '#b1bace',
      header: '#296891',
      em: accent,
      accent,
      strong: '#969dad',
      actionsBg: '#22232a',
      blue,
      mark: '#dd7d85',
      link: blue, 
      btn: '#c693c3',
      info: '#5eb3b3', 
      warn: '#c5b567',
      border: '#2f3238',
      editor: '#969dad' //839295
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
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textColor: t.h1,
      paddingTop: headerPadingTop
    }
    buildRule(h1Props, parentSelector, 'h1')

    const h2Props: UIComponentProps = {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      textColor: t.header,
      paddingTop: headerPadingTop,
    }
    buildRule(h2Props, parentSelector, 'h2')

    const h3Props: UIComponentProps = {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
      paddingTop: headerPadingTop
    }
    buildRule(h3Props, parentSelector, 'h3')

    const h4Props: UIComponentProps = {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      textAlign: 'left',
      textColor: t.header,
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
      fontSize: 'inherit',
      fontWeight: t.defFontWeight,
      textColor: 'inherit'
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
      fontSize: 'inherit',
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
      padding: '0px'
    }
    buildRule(listProps, parentSelector, 'ul')

    /******************************/
    // table
    /******************************/

    const tableProps: UIComponentProps = {
      width: '100%',
      fontSize: '0.9rem',
      textColor: 'inherit',
      fontWeight: t.defFontWeight,
      border: '1px solid ' + t.text50,
    }
    buildRule(tableProps, parentSelector, 'table')

    const tdProps: UIComponentProps = {
      fontSize: 'inherit',
      textColor: 'inherit',
      fontWeight: 'inherit',
      border: '1px solid ' + t.text50,
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
      bgImage: t.isLight ? 'linear-gradient(#4ed0ad00, #4ed0ad50)' : 'inherit',
      //paddingVertical: '5px'
    }
    buildRule(emphasizeProps, parentSelector, 'em')

    /******************************/
    // mark
    /******************************/

    const markProps: UIComponentProps = {
      fontSize: 'inherit',
      fontWeight: 'inherit',
      //textColor: t.isLight ? 'inherit' : t.appBg,
      bgColor: 'inherit',
      textColor: t.mark,
      //bgImage: t.isLight ? `linear-gradient(${t.mark + '00'}, ${t.mark + '50'})` : 'inherit',
    }

    buildRule(markProps, parentSelector, 'mark')

     /******************************/
    // code ``
    /******************************/

    const monoFontProps: UIComponentProps = {
      fontSize: '0.9rem',
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

    const blockquoteContentProps: UIComponentProps = {
      //marginVertical: '20px',
      //paddingVertical: '10px',
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      margin: '0px',
      fontSize: '0.9rem',
      textColor: t.green,
      borderLeft: '1px solid ' + t.green + '88'
    }
    buildRule(blockquoteContentProps, parentSelector, 'blockquote')

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
      fontSize: '0.9rem',
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
      //height: '1px',
      border: ['1px', 'solid', t.header],
      marginBottom: '20px',
    }
    buildRule(hrProps, parentSelector, 'hr')

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
      fontSize: '0.9rem'
    }
    buildRule(poemProps, parentSelector, 'div.poem')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.poem div')

    /******************************/
    // info
    /******************************/

    const infoProps: UIComponentProps = {
      width: '100%',
      fontSize: '0.9rem',
      fontWeight: t.defFontWeight,
      textColor: t.info,
      paddingHorizontal: '20px',
      //bgColor: '#e5f0df',
      borderLeft: '1px solid ' + t.info + '88'
    }
    buildRule(infoProps, parentSelector, 'div.info')
    buildRule({ fontSize: 'inherit', textColor: 'inherit' }, parentSelector, 'div.info div')

    /******************************/
    // warn
    /******************************/

    const warnProps: UIComponentProps = {
      width: '100%',
      fontSize: '0.9rem',
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