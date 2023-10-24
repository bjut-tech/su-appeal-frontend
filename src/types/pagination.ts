export interface CursorPagination<T> {
  pinned?: T[]
  data: T[]
  cursor: string | null
}
