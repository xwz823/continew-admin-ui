<template>
  <div class="container">
    <a-row :gutter="16">
      <a-col :span="24" :md="18" class="section">
        <GiTable
          v-model:selectedKeys="selectedKeys"
          row-key="id"
          :data="dataList"
          :columns="tableColumns"
          :loading="loading"
          :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
          style="max-height: 600px"
          :pagination="pagination"
          :disabled-tools="['size', 'fullscreen', 'setting', 'refresh']"
          :row-selection="{ type: props.multiple ? 'checkbox' : 'radio', showCheckedAll: true }"
          @select="onRowSelect"
          @select-all="onTableSelectAll"
          @refresh="search"
        >
          <template #top>
            <div>
              <a-space class="mt-5">
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
            </div>
            <a-alert class="mt-5">
              <template v-if="selectedKeys.length > 0">
                已选中{{ selectedKeys.length }}条记录(可跨页)
              </template>
              <template v-else>
                未选中任何用户
              </template>
              <template v-if="selectedKeys.length > 0" #action>
                <a-link @click="onClearSelected">清空</a-link>
              </template>
            </a-alert>
          </template>

          <template #status="{ record }">
            <GiCellStatus :status="record.status" />
          </template>
          <template #gender="{ record }">
            <GiCellGender :gender="record.gender" />
          </template>
        </GiTable>
      </a-col>

      <a-col :span="24" :md="6" class="section">
        <a-card title="已选用户">
          <a-table :columns="rightColumn" :data="selectedData" :pagination="paginationOptions">
            <template #nickname="{ record }">
              {{ record.nickname }}({{ record.username }})
            </template>
            <template #action="{ record }">
              <a-button @click="handleDeleteSelectUser(record)">
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
import { useDept } from '@/hooks/app'
import { type Options, useTable } from '@/hooks'
import { type UserQuery, type UserResp, listAllUser, listUser } from '@/apis'
import type { UserSelectPropType } from '@/components/UserSelect/type'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { isMobile } from '@/utils'

const props = withDefaults(defineProps<UserSelectPropType & { selectedUsers: string | string[] }>(), {
  multiple: false,
  selectedUsers: () => [],
})

const emit = defineEmits(['update:selectedUsers'])

// 表格列定义
const tableColumns: TableInstanceColumns[] = [
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
  { title: '所属部门', dataIndex: 'deptName', ellipsis: true, tooltip: true, minWidth: 180 },
  { title: '角色', dataIndex: 'roleNames', minWidth: 160, slotName: 'roleNames' },
  { title: '手机号', dataIndex: 'phone', minWidth: 170, ellipsis: true, tooltip: true },
  { title: '邮箱', dataIndex: 'email', minWidth: 170, ellipsis: true, tooltip: true },
  { title: '系统内置', slotName: 'isSystem', width: 100, align: 'center', show: false },
  { title: '描述', dataIndex: 'description', minWidth: 130, ellipsis: true, tooltip: true },
  { title: '创建人', dataIndex: 'createUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '修改人', dataIndex: 'updateUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '修改时间', dataIndex: 'updateTime', width: 180, show: false },
]

// 右侧已选用户列定义
const rightColumn = [
  { title: '用户', dataIndex: 'nickname', slotName: 'nickname', minWidth: 140, ellipsis: true, tooltip: true },
  { title: '操作', dataIndex: 'action', slotName: 'action' },
]

// 查询表单
const queryForm = reactive<UserQuery>({
  sort: ['t1.createTime,desc'],
})
// 定义分页器参数
const paginationOptions: Options = {
  defaultPageSize: 10,
  defaultSizeOptions: [10, 20, 30, 40, 50],
}

// 用户列表
const { tableData: dataList, loading, pagination, search } = useTable(
  (page) => listUser({ ...queryForm, ...page }),
  { immediate: false, formatResult: (data) => data.map((i) => ({ ...i, disabled: false })) },
)

// 重置
const reset = () => {
  queryForm.description = undefined
  queryForm.deptId = undefined
  search()
}

const treeRef = ref()
// 部门列表
const { deptList, getDeptList } = useDept({
  onSuccess: () => {
    nextTick(() => treeRef.value?.expandAll(true))
  },
})

// 过滤部门
const filterDeptOptions = (searchKey: string, nodeData: TreeNodeData) => {
  if (nodeData.title) {
    return nodeData.title.toLowerCase().includes(searchKey.toLowerCase())
  }
  return false
}

const allUsers = ref<UserResp[]>() // 用于存储所有用户信息
const selectedKeys = ref<string[]>([]) // 使用 Array 来存储选中的 id
const selectedData = ref<Set<UserResp>>(new Set()) // 使用 Set 来存储选中的用户对象

const emitSelectedUsers = () => {
  emit('update:selectedUsers', selectedKeys.value)
}
// 行选择事件
const onRowSelect = (rowKeys: string[], rowKey: string, record: UserResp) => {
  if (props.multiple) {
    // 多选
    if (rowKeys.includes(rowKey)) {
      // 包含 选中
      selectedData.value.add(record)
      selectedKeys.value?.push(rowKey)
    } else {
      // 不包含 去除
      selectedData.value.delete(record)
      selectedKeys.value?.splice(selectedKeys.value?.indexOf(rowKey), 1)
    }
  } else {
    // 单选
    selectedData.value.clear()
    selectedKeys.value = []
    if (rowKeys.includes(rowKey)) {
      // 包含 选中
      selectedData.value.add(record)
      selectedKeys.value?.push(rowKey)
    }
  }
  emitSelectedUsers()
}

// 全选事件
const onTableSelectAll = (checked: boolean) => {
  if (checked) {
    // 选中
    dataList.value.forEach((item) => {
      selectedData.value.add(item)
      selectedKeys.value?.push(item.id)
    })
  } else {
    // 取消选中
    dataList.value.forEach((item) => {
      selectedData.value.delete(item)
      selectedKeys.value?.splice(selectedKeys.value?.indexOf(item.id), 1)
    })
  }

  emitSelectedUsers()
}

// 从选中列表中移除用户
const handleDeleteSelectUser = (user: UserResp) => {
  selectedData.value.delete(user)
  selectedKeys.value?.splice(selectedKeys.value?.indexOf(user.id), 1)
  emitSelectedUsers()
}

// 清空所有选中数据
const onClearSelected = () => {
  selectedData.value.clear()
  selectedKeys.value = []
  emitSelectedUsers()
}

// 初始化函数
const init = async (selectUsers: string[]) => {
  getDeptList()
  search()
  // 获取所有用户数据
  const { data } = await listAllUser({})
  allUsers.value = data

  // 过滤已选择的用户
  if (selectUsers && selectUsers.length > 0) {
    if (props.multiple) {
      selectedData.value = new Set(allUsers.value.filter((item) => selectUsers.includes(item.id)))
      selectedKeys.value = Array.from(selectedData.value).map((user) => user.id)
    } else {
      selectedData.value = new Set(allUsers.value.filter((item) => selectUsers[0] === item.id))
      selectedKeys.value = Array.from(selectedData.value).map((user) => user.id)
    }
  }
}

defineExpose({ init, onClearSelected })
</script>

<style scoped>
.container {
  padding: 20px;
}

.section {
  margin-bottom: 20px;
}

.mt-5 {
  margin-top: 5px;
}
</style>
