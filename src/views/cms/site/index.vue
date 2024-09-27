<template>
  <div class="table-page">
    <GiTable
      row-key="id"
      title="站点管理"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #custom-left>
	    <a-input v-model="queryForm.name" placeholder="请输入站点名称" allow-clear @change="search">
	      <template #prefix><icon-search /></template>
	    </a-input>
	    <a-input v-model="queryForm.bindDomain" placeholder="请输入绑定域名" allow-clear @change="search">
	      <template #prefix><icon-search /></template>
	    </a-input>
        <a-button @click="reset">重置</a-button>
      </template>
      <template #custom-right>
        <a-button v-permission="['site:siteInfo:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <span>新增</span>
        </a-button>
        <a-tooltip content="导出">
          <a-button v-permission="['site:siteInfo:export']" class="gi_hover_btn-border" @click="onExport">
            <template #icon>
              <icon-download />
            </template>
          </a-button>
        </a-tooltip>
      </template>
      <template #name="{ record }">
        <a-link @click="onDetail(record)">{{ record.name }}</a-link>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['site:siteInfo:update']" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['site:siteInfo:delete']"
            status="danger"
            :disabled="record.disabled"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <SiteInfoAddModal ref="SiteInfoAddModalRef" @save-success="search" />
    <SiteInfoDetailDrawer ref="SiteInfoDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import SiteInfoAddModal from './SiteInfoAddModal.vue'
import SiteInfoDetailDrawer from './SiteInfoDetailDrawer.vue'
import { type SiteInfoResp, type SiteInfoQuery, deleteSiteInfo, exportSiteInfo, listSiteInfo } from '@/apis/cms/site'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { useDict } from '@/hooks/app'

defineOptions({ name: 'SiteInfo' })


const queryForm = reactive<SiteInfoQuery>({
  name: undefined,
  bindDomain: undefined,
  sort: ['createTime,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listSiteInfo({ ...queryForm, ...page }), { immediate: true })

const columns: TableInstanceColumns[] = [
  { title: '站点名称', dataIndex: 'name', slotName: 'name' },
  { title: '绑定域名', dataIndex: 'bindDomain', slotName: 'bindDomain' },
  { title: '绑定二级目录', dataIndex: 'bindPath', slotName: 'bindPath' },
  { title: '绑定语言', dataIndex: 'bindLangs', slotName: 'bindLangs' },
  {
    title: '操作',
    slotName: 'action',
    width: 130,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['site:siteInfo:update', 'site:siteInfo:delete'])
  }
]

// 重置
const reset = () => {
  queryForm.name = undefined
  queryForm.bindDomain = undefined
  search()
}

// 删除
const onDelete = (record: SiteInfoResp) => {
  return handleDelete(() => deleteSiteInfo(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportSiteInfo(queryForm))
}

const SiteInfoAddModalRef = ref<InstanceType<typeof SiteInfoAddModal>>()
// 新增
const onAdd = () => {
  SiteInfoAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: SiteInfoResp) => {
  SiteInfoAddModalRef.value?.onUpdate(record.id)
}

const SiteInfoDetailDrawerRef = ref<InstanceType<typeof SiteInfoDetailDrawer>>()
// 详情
const onDetail = (record: SiteInfoResp) => {
  SiteInfoDetailDrawerRef.value?.onDetail(record.id)
}
</script>

<style lang="scss" scoped></style>
