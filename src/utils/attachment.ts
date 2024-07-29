import type { Attachment } from '../types/Attachment'

export const getUrl = (attachment: Attachment): string => {
  return `/api/attachments/${attachment.id}`
}
