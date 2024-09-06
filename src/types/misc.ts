export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export interface ResourceTokenResponse<T> {
  resource_token: TokenResponse
  data: T | null
}

export interface CursorPagination<T> {
  data: T[]
  cursor: string | null
}
