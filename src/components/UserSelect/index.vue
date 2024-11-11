<template>
  <div class="container">
    <a-row :gutter="16">
      <a-col :span="24" :md="18">
        <GiTable
          v-model:selectedKeys="selectedKeys"
          row-key="id"
          :data="dataList"
          :columns="listColumns"
          :loading="loading"
          :scroll="{ x: '100%', y: '100%', minWidth: 900 }"
          style="max-height: 600px"
          :pagination="pagination"
          :disabled-tools="['size', 'fullscreen', 'setting', 'refresh']"
          :row-selection="{ type: props.multiple ? 'checkbox' : 'radio', showCheckedAll: true }"
          @select="onSelect"
          @select-all="onSelectAll"
          @refresh="search"
        >
          <template #top>
            <a-space wrap :size="[8, 8]">
              <a-input v-model="queryForm.description" placeholder="用户名/昵称/描述" allow-clear @change="search" />
              <a-tree-select
                v-model="queryForm.deptId"
                :data="deptList"
                placeholder="请选择所属部门"
                allow-clear
                allow-search
                :filter-tree-node="filterDeptOptions"
                @change="search"
              />
              <a-button @click="reset">
                <template #icon>
                  <icon-refresh />
                </template>
                <template #default>重置</template>
              </a-button>
            </a-space>
            <a-alert>
              <template v-if="selectedKeys.length > 0">
                已选中 {{ selectedKeys.length }} 条记录(可跨页)
              </template>
              <template v-else>
                未选中任何记录
              </template>
              <template v-if="selectedKeys.length > 0" #action>
                <a-link @click="onClearSelected">清空</a-link>
              </template>
            </a-alert>
          </template>

          <template #gender="{ record }">
            <GiCellGender :gender="record.gender" />
          </template>
          <template #status="{ record }">
            <GiCellStatus :status="record.status" />
          </template>
        </GiTable>
      </a-col>
      <a-col :span="24" :md="6" class="section">
        <a-card>
          <template #title>已选择: {{ selectedKeys.length }}</template>
          <a-table :columns="selectedColumns" :data="selectedData" :pagination="paginationOptions">
            <template #nickname="{ record }">
              {{ record.nickname }}({{ record.username }})
            </template>
            <template #action="{ record }">
              <a-button status="danger" size="mini" @click="handleDeleteSelectedUser(record)">
                <icon-delete />
              </a-button>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import type { TreeNodeData } from '@arco-design/web-vue'
import { type UserQuery, type UserResp, listAllUser, listUser } from '@/apis'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { type Options, useTable } from '@/hooks'
import { useDept } from '@/hooks/app'
import { isMobile } from '@/utils'

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  value: () => [],
})

const emit = defineEmits<{
  (e: 'select-user', keys: Array<any>): void
}>()

interface Props {
  multiple?: boolean
  value: string | string[]
}

// 查询表单
const queryForm = reactive<UserQuery>({
  sort: ['t1.createTime,desc', 't1.id,desc'],
})

// 用户列表
const { tableData: dataList, loading, pagination, search } = useTable(
  (page) => listUser({ ...queryForm, ...page }),
  { immediate: true, formatResult: (data) => data.map((i) => ({ ...i, disabled: false })) },
)

// 表格列定义
const listColumns: TableInstanceColumns[] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    slotName: 'nickname',
    minWidth: 140,
    ellipsis: true,
    tooltip: true,
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '用户名', dataIndex: 'username', slotName: 'username', minWidth: 140, ellipsis: true, tooltip: true },
  { title: '状态', slotName: 'status', align: 'center' },
  { title: '性别', dataIndex: 'gender', slotName: 'gender', align: 'center' },
  { title: '所属部门', dataIndex: 'deptName', minWidth: 180, ellipsis: true, tooltip: true },
  { title: '描述', dataIndex: 'description', minWidth: 130, ellipsis: true, tooltip: true },
]

// 右侧已选用户列定义
const selectedColumns = [
  { title: '用户', dataIndex: 'nickname', slotName: 'nickname', minWidth: 140, ellipsis: true, tooltip: true },
  { title: '操作', dataIndex: 'action', slotName: 'action', align: 'center', width: 90 },
]
const paginationOptions: Options = {
  defaultPageSize: 10,
  defaultSizeOptions: [10, 20, 30, 40, 50],
}

// 重置
const reset = () => {
  queryForm.description = undefined
  queryForm.deptId = undefined
  search()
}

// 选中用户 ID
const selectedKeys = ref<string[]>([])
// 选中用户信息
const selectedData = ref<UserResp[]>([])

const emitSelectUser = () => {
  emit('select-user', selectedKeys.value)
}

// 单选
const onSelect = (rowKeys: string[], rowKey: string, record: UserResp) => {
  if (props.multiple) {
    // 多选
    if (rowKeys.includes(rowKey)) {
      // 包含 选中
      selectedData.value.push(record)
      selectedKeys.value?.push(rowKey)
    } else {
      // 不包含 去除
      selectedData.value = selectedData.value.filter((item) => item.id !== rowKey)
      selectedKeys.value?.splice(selectedKeys.value?.indexOf(rowKey), 1)
    }
  } else {
    // 单选
    selectedData.value = []
    selectedKeys.value = []
    if (rowKeys.includes(rowKey)) {
      // 包含 选中
      selectedData.value.push(record)
      selectedKeys.value?.push(rowKey)
    }
  }
  emitSelectUser()
}

// 全选
const onSelectAll = (checked: boolean) => {
  if (checked) {
    // 选中
    dataList.value.forEach((item) => {
      selectedData.value.push(item)
      selectedKeys.value?.push(item.id)
    })
  } else {
    // 取消选中
    dataList.value.forEach((item) => {
      selectedData.value = selectedData.value.filter((i) => i.id !== item.id)
      selectedKeys.value?.splice(selectedKeys.value?.indexOf(item.id), 1)
    })
  }
  emitSelectUser()
}

// 从选中列表中移除用户
const handleDeleteSelectedUser = (user: UserResp) => {
  selectedData.value = selectedData.value.filter((i) => i.id !== user.id)
  selectedKeys.value?.splice(selectedKeys.value?.indexOf(user.id), 1)
  emitSelectUser()
}

// 清空所有选中数据
const onClearSelected = () => {
  selectedData.value = []
  selectedKeys.value = []
  emitSelectUser()
}

// 部门列表
const { deptList, getDeptList } = useDept()
// 过滤部门
const filterDeptOptions = (searchKey: string, nodeData: TreeNodeData) => {
  if (nodeData.title) {
    return nodeData.title.toLowerCase().includes(searchKey.toLowerCase())
  }
  return false
}

onMounted(async () => {
  await getDeptList()
  // 过滤已选择的用户
  if (props.value && props.value.length > 0) {
    const { data } = await listAllUser({ userIds: props.value })
    if (props.multiple) {
      selectedData.value = data.filter((item) => props.value.includes(item.id))
      selectedKeys.value = Array.from(selectedData.value).map((user) => user.id)
    } else {
      selectedData.value = data.filter((item) => props.value[0] === item.id)
      selectedKeys.value = Array.from(selectedData.value).map((user) => user.id)
    }
  }
})

defineExpose({ onClearSelected })
</script>

<style scoped>
:deep(.arco-row-align-start) {
  align-items: normal;
}

.container {
  padding: 0 20px;
}
</style>
