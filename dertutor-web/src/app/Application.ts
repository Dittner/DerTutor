import { RXObservableValue } from 'flinker'

export interface Layout {
  isMobile: boolean
  isCompact: boolean
  navBarHeight: number
  statusBarHeight: number
  contentWidth: number
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

    console.log('isMobileDevice: ' + this.isMobileDevice)
    console.log('localStorage, theme: ' + window.localStorage.getItem('theme'))
    window.addEventListener('resize', () => { this.$windowWidth.value = window.innerWidth })
    window.addEventListener('scroll', () => this.$scrollY.value = window.scrollY, false);
    this.watchHistoryEvents()
    this.updateLocation()
  }

  private getLayout(): Layout {
    const windowWidth = window.innerWidth - 20
    const isCompact = this.isMobileDevice || windowWidth < 1200
    const contentWidth = isCompact ? windowWidth : this.isMobileDevice ? windowWidth : Math.min(960, windowWidth - 600)
    const leftSideMenuWidth = this.isMobileDevice ? 0 : (windowWidth - contentWidth) * 0.45
    
    console.log('Layout is changed, wid:', window.innerWidth)

    return {
      isMobile: this.isMobileDevice,
      isCompact,
      navBarHeight: 60,
      statusBarHeight: 30,
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
      console.log('!!!! cur location:', document.location.pathname)
    }

    window.history.replaceState = function (...args) {
      replaceState.apply(window.history, args)
      window.dispatchEvent(new Event('replaceState'))
      console.log('!!!! cur location:', document.location.pathname)
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
        console.warn('Clipboard API or writeText is not available in this browser.');
        // Fallback for older browsers if necessary (e.g., using document.execCommand('copy'))
        // This fallback is more complex and often requires creating a temporary element.
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
}
