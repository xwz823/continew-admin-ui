export interface UserSelectPropType {
  multiple: boolean
  value?: string[]
}

export interface UserItem {
  id: string
  nickname: string
  deptName: string
  roleNames: string
  phone: string
  email: string
  status: number
}
