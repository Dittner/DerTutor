import { RXObservableValue } from 'flinker'
import { log, logErr, logWarn } from './Logger'

export const ARTICLE_WIDTH = 950

export interface Layout {
  isMobile: boolean
  isCompact: boolean
  navBarHeight: number
  statusBarHeight: number
  contentWidth: number
  paddingHorizontal: number
  leftSideMenuWidth: number
}

export interface BrowserLocation {
  path: string
  queries: string
}

export type UpdateUrlMode = 'push' | 'replace'

export class Application {
  readonly $layout: RXObservableValue<Layout>
  readonly $windowWidth: RXObservableValue<number>
  readonly $location: RXObservableValue<BrowserLocation>
  readonly $pathName = new RXObservableValue('')
  readonly $scrollY = new RXObservableValue(0)
  readonly $err = new RXObservableValue('')
  readonly $dropdownState = new RXObservableValue('')

  readonly isMobileDevice: boolean

  constructor() {
    this.isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
    this.$windowWidth = new RXObservableValue(window.innerWidth)
    this.$layout = new RXObservableValue(this.getLayout())
    this.$location = new RXObservableValue({ path: document.location.pathname, queries: document.location.search })

    this.$windowWidth.pipe()
      .debounce(1000)
      .onReceive(_ => this.$layout.value = this.getLayout())
      .subscribe()

    log('isMobileDevice: ' + this.isMobileDevice)
    log('localStorage, theme: ' + window.localStorage.getItem('theme'))
    window.addEventListener('resize', () => { this.$windowWidth.value = window.innerWidth })
    window.addEventListener('scroll', () => this.$scrollY.value = window.scrollY, false);
    this.watchHistoryEvents()
    this.updateLocation()
  }

  
  private getLayout(): Layout {
    const windowWidth = window.innerWidth
    const isCompact = this.isMobileDevice || windowWidth < 1200
    const contentWidth = isCompact ? windowWidth : this.isMobileDevice ? windowWidth : Math.min(ARTICLE_WIDTH, windowWidth - 600)
    const leftSideMenuWidth = this.isMobileDevice ? 0 : (windowWidth - contentWidth) * 0.45
    
    log('Layout is changed, wid:', window.innerWidth)

    return {
      isMobile: this.isMobileDevice,
      isCompact,
      navBarHeight: 70,
      statusBarHeight: 30,
      paddingHorizontal: isCompact ? 20 : 60,
      contentWidth,
      leftSideMenuWidth
    }
  }

  navigate(to: string, mode: UpdateUrlMode) {
    mode === 'push' ? window.history.pushState('', '', to) : window.history.replaceState('', '', to)
  }

  private watchHistoryEvents() {
    const { pushState, replaceState } = window.history

    window.history.pushState = function (...args) {
      pushState.apply(window.history, args)
      window.dispatchEvent(new Event('pushState'))
      log('!!!! cur location:', document.location.pathname)
    }

    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args)
      window.dispatchEvent(new Event('replaceState'))
      log('!!!! cur location:', document.location.pathname)
    }

    window.addEventListener('popstate', () => { this.updateLocation() })
    window.addEventListener('replaceState', () => { this.updateLocation() })
    window.addEventListener('pushState', () => { this.updateLocation() })
  }

  private updateLocation() {
    this.$pathName.value = document.location.hash ? document.location.pathname + '#' + document.location.hash : document.location.pathname
    this.$location.value = { path: document.location.pathname, queries: document.location.search }
  }

  async copyTextToClipboard(value: string) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        logWarn('Clipboard API or writeText is not available in this browser.');
        // Fallback for older browsers if necessary (e.g., using document.execCommand('copy'))
        // This fallback is more complex and often requires creating a temporary element.
      }
    } catch (err) {
      logErr('Failed to copy text: ', err);
    }
  }
}
