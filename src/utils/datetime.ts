import { DateTime } from 'luxon'

export const relativeTime = (iso: string): string => {
  return DateTime.fromISO(iso).toRelative()
}
