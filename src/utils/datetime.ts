import { DateTime } from 'luxon'

export const relativeTime = (iso: string): string => {
  const dt = DateTime.fromISO(iso)
  return dt.toRelative() ?? dt.toLocaleString(DateTime.DATETIME_MED)
}

export const formatDate = (iso: string): string => {
  return DateTime.fromISO(iso).toLocaleString(DateTime.DATE_MED)
}

export const formatTime = (iso: string): string => {
  return DateTime.fromISO(iso).toLocaleString(DateTime.DATETIME_MED)
}
