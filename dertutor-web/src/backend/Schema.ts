export interface AuthenticateSchema {
  username: string
  password: string
}

export interface CreateVocSchema {
  lang_id: number
  name: string
}

export interface RenameVocSchema {
  id: number
  name: string
}

export interface DeleteVocSchema {
  id: number
}

export interface CreateNoteSchema {
  lang_id: number
  voc_id: number
  name: string
  text: string
  level: number | undefined
  tag_id: number | undefined
  audio_url: string
}

export interface RenameNoteSchema {
  id: number
  name: string
}

export interface UpdateNoteSchema {
  id: number
  voc_id: number
  name: string
  text: string
  level: number | undefined
  tag_id: number | undefined
  audio_url: string
}

export interface DeleteNoteSchema {
  id: number
}

export interface GetPageSchema {
  lang_id: number
  page: number
  size: number
  key?: string
  voc_id?: number
  level?: number
  tag_id?: number
}

export interface SearchByNameSchema {
  lang_id: number
  name: string
  voc_id?: number
}

export interface CreateMedialFileSchema {
  voc_id: number
  name: string
  text: string
  level: number
  tag_id: number | undefined
  audio_url: string
}

export interface DeleteMedialFileSchema {
  uid: string
}