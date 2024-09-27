import http from '@/utils/http'

const BASE_URL = '/site/siteInfo'

export interface SiteInfoResp {
  name: string
  bindDomain: string
  bindPath: string
  bindLangs: string
  createUserString: string
  updateUserString: string
}
export interface SiteInfoDetailResp {
  id: string
  name: string
  bindDomain: string
  bindPath: string
  bindLangs: string
  options: string
  isDeleted: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface SiteInfoQuery {
  name: string
  bindDomain: string
  sort: Array<string>
}
export interface SiteInfoPageQuery extends SiteInfoQuery, PageQuery {}

/** @desc 查询站点列表 */
export function listSiteInfo(query: SiteInfoPageQuery) {
  return http.get<PageRes<SiteInfoResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询站点详情 */
export function getSiteInfo(id: string) {
  return http.get<SiteInfoDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增站点 */
export function addSiteInfo(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改站点 */
export function updateSiteInfo(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除站点 */
export function deleteSiteInfo(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出站点 */
export function exportSiteInfo(query: SiteInfoQuery) {
  return http.download<any>(`${BASE_URL}/export`, query)
}
