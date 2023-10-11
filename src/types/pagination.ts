export interface CursorPagination<T> {
  data: T[]
  cursor: string | null
}
