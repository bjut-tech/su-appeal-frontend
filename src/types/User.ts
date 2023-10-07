export interface User {
  id: number
  uid: string
  role: 'STUDENT' | 'TEACHER'
  name: string | null
  admin: boolean
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
