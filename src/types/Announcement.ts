import type { User } from './User'
import type { Attachment } from './Attachment'

export interface Announcement {
  id: number
  user: User
  title: string
  content: string
  attachments: Attachment[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}
