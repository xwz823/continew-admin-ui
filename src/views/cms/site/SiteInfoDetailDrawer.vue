<template>
  <a-drawer v-model:visible="visible" title="站点详情" :width="width >= 580 ? 580 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="站点名称">{{ dataDetail?.name }}</a-descriptions-item>
      <a-descriptions-item label="绑定域名">{{ dataDetail?.bindDomain }}</a-descriptions-item>
      <a-descriptions-item label="绑定二级目录">{{ dataDetail?.bindPath }}</a-descriptions-item>
      <a-descriptions-item label="绑定语言">{{ dataDetail?.bindLangs }}</a-descriptions-item>
      <a-descriptions-item label="其他扩展字段">{{ dataDetail?.options }}</a-descriptions-item>
      <a-descriptions-item label="逻辑删除;（0否 1是）">{{ dataDetail?.isDeleted }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { type SiteInfoDetailResp, getSiteInfo } from '@/apis/cms/site'

const { width } = useWindowSize()

const visible = ref(false)
const dataId = ref('')
const dataDetail = ref<SiteInfoDetailResp>()
// 查询详情
const getDataDetail = async () => {
  const res = await getSiteInfo(dataId.value)
  dataDetail.value = res.data
}

// 打开详情
const onDetail = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onDetail })
</script>

<style lang="scss" scoped></style>
