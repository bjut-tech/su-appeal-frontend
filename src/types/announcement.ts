import type { User } from './user.ts'
import type { Attachment } from './attachment.ts'

export interface Announcement {
  id: number
  user: User
  category: AnnouncementCategory | null
  title: string
  content: string
  attachments: Attachment[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface AnnouncementCategory {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface AnnouncementCarousel {
  id: number
  announcement: Announcement
  cover: Attachment | null
}

export interface AnnouncementAutocompleteItem {
  id: number
  title: string
  content: string
}
