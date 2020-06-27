import Dexie from 'dexie'
import { cfg } from './config'

export interface Message {
  id?: number
  owner?: string
  topic: string
  moment: number
  sender: string
  content: string
}

class AppDatabase extends Dexie {
  message!: Dexie.Table<Message, number>
  constructor() {
    super(cfg.appKey)
    this.version(cfg.dbVersion).stores({
      message: '++id, topic, owner, moment, sender'
    })
    this.message = this.table('message')
  }
}

const db = new AppDatabase()

export default db