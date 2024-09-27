import http from '@/utils/http'

const BASE_URL = '/system/language'

export interface LanguagesResp {
  id: string
  name: string
  iso2: string
  iso3: string
  nativeName: string
  isActive: string
}
export interface LanguagesDetailResp {
  id: string
  name: string
  iso2: string
  iso3: string
  nativeName: string
  isActive: string
  createUserString: string
  updateUserString: string
}
export interface LanguagesQuery {
  sort: Array<string>
}
export interface LanguagesPageQuery extends LanguagesQuery, PageQuery {}

/** @desc 查询语言信息列表 */
export function listLanguages(query: LanguagesPageQuery) {
  return http.get<PageRes<LanguagesResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询语言信息详情 */
export function getLanguages(id: string) {
  return http.get<LanguagesDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增语言信息 */
export function addLanguages(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改语言信息 */
export function updateLanguages(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除语言信息 */
export function deleteLanguages(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出语言信息 */
export function exportLanguages(query: LanguagesQuery) {
  return http.download<any>(`${BASE_URL}/export`, query)
}
