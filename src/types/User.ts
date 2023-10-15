export interface User {
  id: number
  uid: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export interface UserPrincipal {
  user: User
  username: string
  authorities: Array<{
    authority: string
  }>
  enabled: boolean
  credentialsNonExpired: boolean
  accountNonExpired: boolean
  accountNonLocked: boolean
}
