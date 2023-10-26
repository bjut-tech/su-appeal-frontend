import type { Attachment } from './Attachment'
import type { User } from './User'

export interface Question {
  id: number
  user: User
  contact: string
  campus: string
  content: string
  attachments: Attachment[]
  answer: Answer | null
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: number
  user: User
  content: string
  attachments: Attachment[]
  likesCount: number
  createdAt: string
  updatedAt: string
}
