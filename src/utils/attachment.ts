import type { Attachment } from '../types/Attachment'

export const getUrl = (attachment: Attachment): string => {
  return `${import.meta.env.VITE_API_URL}/attachments/${attachment.id}`
}
