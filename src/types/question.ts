import type { Attachment } from './attachment.ts'
import type { User } from './user.ts'

export interface Question {
  id: number
  user: User | null
  category: QuestionCategory | null
  contact: string
  campus: string
  content: string
  attachments: Attachment[]
  answer: Answer | null
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface QuestionCategory {
  id: number
  name: string
  description: string
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
