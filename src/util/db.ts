import Dexie from 'dexie'
import { cfg } from './config'

export interface Message {
  id?: number
  owner?: string
  topic: string
  moment: number
  sender: string
  category?: 'plain' | 'markdown'
  content: string
}

export interface Sticker {
  id?: number
  owner?: string
  name?: string
  url: string
}

class AppDatabase extends Dexie {
  message!: Dexie.Table<Message, number>
  sticker!: Dexie.Table<Sticker, number>
  constructor() {
    super(cfg.appKey)
    this.version(cfg.dbVersion).stores({
      message: '++id, topic, owner, moment, sender, category',
      sticker: '++id, owner, name, url'
    })
    this.message = this.table('message')
    this.sticker = this.table('sticker')
  }
}

const db = new AppDatabase()

export default db