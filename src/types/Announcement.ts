import type { User } from './User'
import type { Attachment } from './Attachment'

export interface Announcement {
  id: number
  user: User
  title: string
  content: string
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface AnnouncementShow {
  id: number
  title: string
  content: string
  attachments: Attachment[]
  createdAt: string
}
