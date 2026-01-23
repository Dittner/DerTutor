import { RXObservableValue } from "flinker"
import { globalContext } from "../App"
import { Application, BrowserLocation, UpdateUrlMode } from "./Application"
import { delay } from "./Utils"
import { log, logErr } from "./Logger"

export interface UrlKeys {
  readonly langCode?: string
  readonly vocCode?: string
  readonly noteId?: number
  readonly level?: number
  readonly tagId?: number
  readonly searchKey?: string
  readonly sort?: string
  readonly page?: number
  readonly edit?: boolean
}

export class URLNavigator {
  readonly $keys = new RXObservableValue<UrlKeys>({})

  constructor(app: Application) {
    app.$location.pipe()
      .onReceive(location => {
        log('URLNavigator: received new location')
        this.$keys.value = this.parseUrl(location)
      })
      .subscribe()
  }

  //url=/en/lexicon?page=1&note=20&level=0&tag=0&edit
  //url=/en/search?key=some_text&page=1&note=20&edit
  private parseUrl(location: BrowserLocation): UrlKeys {
    log('new url:', location.path + location.queries)
    const path = location.path.startsWith('/') ? location.path.slice(1) : location.path
    const values = path.split('/')
    const params = new URLSearchParams(location.queries)

    return {
      langCode: values.length > 0 ? values[0] || undefined : undefined,
      vocCode: values.length > 1 && values[1] !== 'search' ? values[1] || undefined : undefined,
      noteId: params.has('note') ? Number(params.get('note')) : undefined,
      level: params.has('level') ? Number(params.get('level')) : undefined,
      tagId: params.has('tag') ? Number(params.get('tag')) : undefined,
      page: params.has('page') ? Number(params.get('page')) : undefined,
      edit: params.has('edit') ? true : undefined,
      searchKey: params.has('key') ? params.get('key') ?? '' : undefined,
      sort: params.has('sort') ? params.get('sort') ?? '' : undefined,
    }
  }

  buildLink(keys: UrlKeys) {
    if (!keys.langCode) return '/'

    if (keys.vocCode === undefined && keys.searchKey === undefined) return `/${keys.langCode}`

    let res = `/${keys.langCode}`
    res += keys.searchKey !== undefined ? '/search?' : `/${keys.vocCode}?`
    res += keys.page !== undefined ? `page=${keys.page}` : 'page=1'
    if (keys.noteId !== undefined) res += `&note=${keys.noteId}`
    if (keys.level !== undefined) res += `&level=${keys.level}`
    if (keys.tagId !== undefined) res += `&tag=${keys.tagId}`
    if (keys.searchKey !== undefined) res += `&key=${keys.searchKey}`
    if (keys.sort !== undefined) res += `&sort=${keys.sort}`
    if (keys.edit) res += `&edit`
    return res
  }

  navigateTo(keys: UrlKeys, mode: UpdateUrlMode = 'push') {
    if (this.infiniteLoopDetected) return
    this.countNavRequests()
    globalContext.app.navigate(this.buildLink(keys), mode)
  }

  updateWith(keys: UrlKeys, mode: UpdateUrlMode = 'push') {
    this.navigateTo({ ...this.$keys.value, ...keys }, mode)
  }

  private counter = 0
  private infiniteLoopDetected = false
  private async countNavRequests() {
    if (this.counter < 50) {
      this.counter++
      if (this.counter === 1) {
        await delay(1000)
        this.counter = 0
      }
    } else {
      this.infiniteLoopDetected = true
      globalContext.app.$err.value = 'Infinite loop is detected'
      logErr('URLNavigator: Infinite loop is detected, keys:', this.$keys.value)
    }
  }
}