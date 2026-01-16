import { RXObservableValue } from "flinker"

import { AVAILABLE_LEVELS, DomainService, ILang, INote, IPage, IVoc } from "../../../domain/DomainModel"
import { DerTutorContext } from "../../../DerTutorContext"
import { ViewModel } from "../ViewModel"
import { CreateNoteSchema, DeleteNoteSchema, GetPageSchema, RenameNoteSchema, SearchByNameSchema } from "../../../backend/Schema"
import { UrlKeys } from "../../../app/URLNavigator"
import { globalContext } from "../../../App"
import { Interactor } from "../Interactor"
import { log } from "../../../app/Logger"

export interface NoteListState {
  allLangs?: ILang[]
  lang?: ILang
  voc?: IVoc
  page?: IPage
  selectedNote?: INote
  searchKey?: string
  searchMode?: boolean
  level?: number
  tagId?: number
}

export class NoteListVM extends ViewModel<NoteListState> {
  readonly $state = new RXObservableValue<Readonly<NoteListState>>({})
  readonly $selectedNoteIndex = new RXObservableValue(-1)

  readonly $noteListShown = new RXObservableValue(true)
  readonly $filtersShown = new RXObservableValue(true)

  readonly $searchBuffer = new RXObservableValue('')
  readonly $searchBufferFocused = new RXObservableValue(false)

  readonly $quickSearchBuffer = new RXObservableValue('')
  readonly $quickSearchFocused = new RXObservableValue(false)
  readonly $quickSearchResult = new RXObservableValue<INote | undefined>(undefined)
  readonly $noteNummberOfTotal = new RXObservableValue('')


  constructor(ctx: DerTutorContext) {
    const interactor = new NoteListInteractor(ctx)
    super('notes', ctx, interactor)
    this.addKeybindings()

    //this.$noteListShown = new RXObservableValue(!globalContext.app.$layout.value.isCompact)
    //this.$filtersShown = new RXObservableValue(!globalContext.app.$layout.value.isCompact)

    globalContext.app.$layout.pipe()
      .onReceive(l => {
        this.$noteListShown.value = !l.isCompact
        this.$filtersShown.value = !l.isCompact
      })
      .subscribe()
  }

  protected override stateDidChange(state: NoteListState) {
    if (!this.activate) return

    this.$state.value = state
    this.$searchBuffer.value = state.searchKey ?? ''

    const page = state.page
    const note = state.selectedNote

    if (state.lang && page && note) {
      const index = page.items.findIndex(child => child.id === note.id)
      this.$selectedNoteIndex.value = index
      this.$noteNummberOfTotal.value = index === -1 ? '' : `${index + 1 + (page.page - 1) * page.size}:${page.total}`
      //this.ctx.$msg.value = { 'text': index != -1 ? `${index + 1 + (page.page - 1) * page.size}:${page.total}` : '', 'level': 'info' }

    } else {
      this.$selectedNoteIndex.value = -1
      this.$noteNummberOfTotal.value = '0:0'
      //this.ctx.$msg.value = { text: '0:0', level: 'info' }

      if (state.searchKey !== undefined) {
        this.focusGlobalSearchInput()
      }
    }

    this.ctx.$msg.value = undefined
    window.scrollTo(0, 0)
    this.$noteListShown.value = !globalContext.app.$layout.value.isCompact
    this.$filtersShown.value = !globalContext.app.$layout.value.isCompact
  }

  private addKeybindings() {
    this.addDefaultKeybindings()

    this.actionsList.add('g', 'Select first note', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last note', () => this.moveCursorToTheLast())

    this.actionsList.add('<Right>', 'Select next note', () => this.moveNext())
    this.actionsList.add('<Left>', 'Select prev note', () => this.movePrev())

    this.actionsList.add('n', 'New note (SUPERUSER)', () => this.createNote())
    this.actionsList.add('r', 'Rename note (SUPERUSER)', () => this.renameNote())
    this.actionsList.add('e', 'Edit note (SUPERUSER)', () => this.edit())
    this.actionsList.add(':d<CR>', 'Delete note (SUPERUSER)', () => this.deleteNote())
    this.actionsList.add('/', 'Quick Search', () => this.focusGlobalSearchInput())
    this.actionsList.add('<C-k>', 'Global Search', () => this.$searchBufferFocused.value = true)

    this.actionsList.add('<Space>', 'Play audio', () => this.playAudio(this.$state.value?.selectedNote?.audio_url || this.$quickSearchResult.value?.audio_url || ''))
    this.actionsList.add(':id<CR>', 'Print ID of note', () => this.printID())
    this.actionsList.add('q', 'Quit', () => this.quit())
  }

  moveNext() {
    const p = this.$state.value.page
    const n = this.$state.value.selectedNote
    if (!p || !n) return

    const index = p.items.findIndex(child => child.id === n.id)
    if (index !== -1) {
      if (index < p.items.length - 1)
        this.reloadWithNote(p.items[index + 1])
      else if (p.page < p.pages)
        this.navigator.updateWith({ page: p.page + 1 })
    }
  }

  movePrev() {
    const p = this.$state.value.page
    const n = this.$state.value.selectedNote
    if (!p || !n) return

    const index = p.items.findIndex(child => child.id === n.id)
    if (index !== -1) {
      if (index > 0)
        this.reloadWithNote(p.items[index - 1])
      else if (p.page > 1)
        this.navigator.updateWith({ page: p.page - 1 })
    }
  }

  private moveCursorToTheLast() {
    const p = this.$state.value.page
    if (p && p.items.length > 0)
      this.reloadWithNote(p.items[p.items.length - 1])
  }

  private moveCursorToTheFirst() {
    const p = this.$state.value.page
    if (p && p.items.length > 0)
      this.reloadWithNote(p.items[0])
  }

  private quit() {
    this.navigator.navigateTo({ langCode: this.$state.value.lang?.code })
  }

  private edit() {
    if (!this.ctx.$user.value) {
      this.ctx.$msg.value = { text: 'User not authorized', level: 'warning' }
      return
    }

    if (!this.ctx.$user.value.is_superuser) {
      this.ctx.$msg.value = { text: 'You do not have permission to edit any note', level: 'warning' }
      return
    }

    if (!this.inputMode.$isActive.value) {
      this.navigator.updateWith({ edit: true })
    } else {
      this.ctx.$msg.value = { level: 'error', text: 'Editor should be closed before starting editting another note' }
    }
  }

  private async createNote() {
    if (this.inputMode.$isActive.value) return
    if (!this.$state.value.voc) {
      this.ctx.$msg.value = { text: 'Vocabulary not selected' }
      return
    }

    const res = await this.inputMode.activate('New:', '').asAwaitable

    if (!res.isCanceled) {
      const lang = this.$state.value.lang
      const voc = this.$state.value.voc
      const name = res.value.trim()
      if (lang && voc && name) {
        const scheme = {} as CreateNoteSchema
        scheme.lang_id = lang.id
        scheme.voc_id = voc.id
        scheme.name = name
        scheme.text = '# ' + name + '\n\n' + (lang.code === 'en' ? '## E.g.\n' : '## Bsp.\n')
        scheme.level = this.navigator.$keys.value.level
        scheme.tag_id = this.navigator.$keys.value.tagId
        scheme.audio_url = ''

        log('Creating note, schema:', scheme)
        log('Creating note, json:', JSON.stringify(scheme))

        this.server.createNote(scheme).pipe()
          .onReceive((n: INote | undefined) => {
            log('NoteListVM:applyInput, creating note, result: ', n)
            if (n) {
              this.interactor.clearCache()
              this.navigator.updateWith({ page: 1, noteId: n.id })
            }
          })
          .onError(e => {
            this.ctx.$msg.value = { level: 'error', text: e.message }
          })
          .subscribe()
      }
    }
  }

  private async renameNote() {
    if (this.inputMode.$isActive.value) return
    if (!this.$state.value.selectedNote) {
      this.ctx.$msg.value = { text: 'Note not selected' }
      return
    }

    const res = await this.inputMode.activate('Rename:', this.$state.value.selectedNote.name).asAwaitable

    if (!res.isCanceled) {
      const page = this.$state.value.page
      const note = this.$state.value.selectedNote
      if (page && note) {
        const newName = res.value.trim()
        if (!newName) {
          this.ctx.$msg.value = { level: 'info', text: 'Empty name' }
          return
        }
        else if (newName === note.name) {
          this.ctx.$msg.value = { level: 'info', text: 'No changes' }
          return
        }

        const scheme = {} as RenameNoteSchema
        scheme.id = note.id
        scheme.name = newName

        this.server.renameNote(scheme).pipe()
          .onReceive((note: INote | undefined) => {
            log('NoteListVM:completeRenaming, res: ', note)
            if (note) {
              this.ctx.$msg.value = { level: 'info', text: 'renamed' }

              const ind = page.items.findIndex(n => n.id === note.id)
              if (ind !== -1 && page) {
                this.interactor.clearCache()
                this.navigator.updateWith({})
              }
            } else {
              this.ctx.$msg.value = { level: 'warning', text: 'Renamed note is failed' }
            }
          })
          .onError(e => {
            const msg = e.message.indexOf('duplicate key') ? 'Note already exists' : e.message
            this.ctx.$msg.value = { level: 'error', text: msg }
          })
          .subscribe()
      }
    }
  }

  private async deleteNote() {
    if (this.inputMode.$isActive.value) return
    if (!this.$state.value.page) return
    if (!this.$state.value.selectedNote) return

    const res = await this.inputMode.activate('Delete [yes|no]?', 'no').asAwaitable

    if (!res.isCanceled) {
      const page = this.$state.value.page
      const note = this.$state.value.selectedNote

      if (page && note) {
        const answer = res.value.trim().toLocaleLowerCase()
        if (answer === 'y' || answer === 'yes') {
          const schema = { id: note.id } as DeleteNoteSchema
          this.server.deleteNote(schema).pipe()
            .onReceive(_ => {
              log('NoteListVM:deleteNote complete')
              this.ctx.$msg.value = { level: 'info', text: 'deleted' }

              const index = page.items.findIndex(child => child.id === note.id) ?? -1
              let nextNote: INote | undefined
              if (index > 0) {
                nextNote = page.items[index - 1]
              } else if (index === 0 && page.items.length > 1) {
                nextNote = page.items[1]
              }

              this.interactor.clearCache()
              this.navigator.updateWith({ noteId: nextNote?.id })
            })
            .onError(e => {
              this.ctx.$msg.value = { level: 'error', text: e.message }
            })
            .subscribe()
        }
      }
    }
  }

  playAudio(url: string) {
    if (url)
      new Audio(this.server.baseUrl + url).play()
  }

  focusGlobalSearchInput() {
    const selectedText = window.getSelection()?.toString() ?? ''
    if (selectedText) this.$quickSearchBuffer.value = selectedText
    this.$quickSearchFocused.value = true
  }

  quickSearch(name: string) {
    if (name.length < 2) {
      this.ctx.$msg.value = { text: 'Search text is too short', level: 'warning' }
      return
    } else if (!this.$state.value.lang) {
      this.ctx.$msg.value = { text: 'Language not selected', level: 'warning' }
      return
    }

    this.$quickSearchBuffer.value = name

    log('NoteListVM.quickSearch by name:', name)
    const scheme = {} as SearchByNameSchema
    scheme.lang_id = this.$state.value.lang.id
    scheme.voc_id = this.$state.value.lang.id //the first vocabularies have the same ids as languages
    scheme.name = name

    globalContext.server.searchNoteByName(scheme).pipe()
      .onReceive(notes => {
        log('NoteListVM.quickSearch result:', notes)
        if (notes.length > 0) {
          this.$quickSearchResult.value = notes[0]
        } else {
          this.ctx.$msg.value = { text: `"${name}" not found` }
          this.$quickSearchResult.value = undefined
        }
      })
      .onError(e => {
        this.ctx.$msg.value = { level: 'error', text: e.message }
        this.$quickSearchResult.value = undefined
      })
  }

  reprLevel(level: number | undefined) {
    return level && level < AVAILABLE_LEVELS.length ? AVAILABLE_LEVELS[level] : ''
  }

  reprTag(tagId: number | undefined) {
    if (tagId)
      return this.$state.value.lang?.tags.find(t => t.id === tagId)?.name ?? ''
    else
      return ''
  }

  startSearch(key: string) {
    if (key) this.navigator.updateWith({ page: 1, searchKey: key })
    else if (this.$state.value.searchKey) this.navigateToLexicon()
  }

  navigateToLexicon() {
    if (this.$state.value.lang && this.$state.value.lang.vocs.length > 0) {
      const voc = this.$state.value.lang.vocs[0]
      this.navigator.navigateTo({ langCode: this.$state.value.lang.code, vocCode: DomainService.encodeName(voc.name) })
    }
  }

  encodeName(value: string) {
    return DomainService.encodeName(value)
  }

  reloadWithNote(n: INote) {
    const lang = this.$state.value.allLangs?.find(l => l.id === n.lang_id)
    const voc = lang && lang.vocs.find(v => v.id === n.voc_id)
    const page = this.$state.value.page
    if (lang && voc && page) {
      const keys = {
        langCode: lang.code,
        vocCode: this.encodeName(voc.name),
        page: page.page,
        noteId: n.id,
        level: this.$state.value.level,
        tagId: this.$state.value.tagId,
        searchKey: this.$state.value.searchKey,
      }

      this.navigator.navigateTo(keys)
    }
  }

  private printID() {
    const n = this.$state.value.selectedNote
    if (n)
      this.ctx.$msg.value = { 'level': 'info', 'text': `ID=${n.id}` }
    else
      this.ctx.$msg.value = { 'level': 'info', 'text': 'Not selected' }
  }
}

class NoteListInteractor extends Interactor<NoteListState> {
  constructor(ctx: DerTutorContext) {
    super(ctx)
    log('new NoteListInteractor')
  }

  override async load(state: NoteListState, keys: UrlKeys) {
    await this.loadLangs(state, keys)
    await this.chooseLang(state, keys)
    await this.chooseVoc(state, keys)
    await this.chooseFilters(state, keys)
    await this.loadPage(state, keys)
    await this.chooseNote(state, keys)
  }

  private async loadLangs(state: NoteListState, keys: UrlKeys) {
    if (this.ctx.$allLangs.value.length === 0)
      this.ctx.$allLangs.value = await globalContext.server.loadAllLangs().asAwaitable
    state.allLangs = this.ctx.$allLangs.value
  }

  private async chooseLang(state: NoteListState, keys: UrlKeys) {
    if (keys.langCode && state.allLangs)
      state.lang = state.allLangs.find(l => l.code === keys.langCode)
  }

  private async chooseVoc(state: NoteListState, keys: UrlKeys) {
    if (state.lang && keys.vocCode)
      state.voc = state.lang.vocs.find(v => DomainService.encodeName(v.name) === keys.vocCode)
  }

  private async chooseFilters(state: NoteListState, keys: UrlKeys) {
    state.searchMode = keys.searchKey !== undefined
    state.searchKey = keys.searchKey
    state.level = keys.level
    state.tagId = keys.tagId
  }

  private async loadPage(state: NoteListState, keys: UrlKeys) {
    if (!state.lang) return
    if (!state.voc && (!keys.searchKey || keys.searchKey.length <= 1)) {
      state.page = {
        items: [],
        total: 0,
        page: 0,
        size: 0,
        pages: 0
      }
      return
    }

    if (!this.prevState.page ||
      this.prevState.page.page !== (keys.page ?? 1) ||
      this.prevState.lang?.id !== state.lang.id ||
      this.prevState.voc?.id !== state.voc?.id ||
      this.prevState.level !== state.level ||
      this.prevState.tagId !== state.tagId ||
      this.prevState.searchKey !== state.searchKey) {

      const isGlobalSearhcing = keys.searchKey && keys.searchKey.length > 1

      const scheme = {} as GetPageSchema
      scheme.lang_id = state.lang.id
      scheme.page = keys.page && keys.page > 0 ? keys.page : 1
      scheme.size = DerTutorContext.PAGE_SIZE
      scheme.voc_id = isGlobalSearhcing ? undefined : state.voc?.id
      scheme.key = isGlobalSearhcing ? keys.searchKey : undefined
      scheme.level = keys.level
      scheme.tag_id = keys.tagId

      log('Interactor.reloadPage, page:', keys.page)
      state.page = await globalContext.server.loadNotes(scheme).asAwaitable
    } else {
      state.page = this.prevState.page
    }
  }

  private async chooseNote(state: NoteListState, keys: UrlKeys) {
    if (!state.page) return
    let note = state.page.items.find(n => n.id === keys.noteId)
    if (!note && state.page.items.length > 0) {
      if (this.prevState.page && this.prevState.page.page < state.page.page) {
        note = state.page.items[0]
      }
      else if (this.prevState.page && this.prevState.page.page > state.page.page) {
        if (this.prevState.lang?.id !== state.lang?.id ||
          this.prevState.voc?.id !== state.voc?.id ||
          this.prevState.level !== state.level ||
          this.prevState.tagId !== state.tagId ||
          this.prevState.searchKey !== state.searchKey) {
          note = state.page.items[0]
        } else {
          note = state.page.items[state.page.items.length - 1]
        }
      }
      else {
        note = state.page.items[0]
      }

      globalContext.navigator.updateWith({ noteId: note.id }, 'replace')
    }
    state.selectedNote = note
  }
}