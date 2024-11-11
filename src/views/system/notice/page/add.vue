<template>
  <div ref="containerRef" class="detail">
    <div class="detail_header">
      <a-affix :target="(containerRef as HTMLElement)">
        <a-page-header title="通知公告" :subtitle="type === 'edit' ? '修改' : '新增'" @back="onBack">
          <template #extra>
            <a-button type="primary" @click="onReleased">
              <template #icon>
                <icon-save v-if="type === 'edit'" />
                <icon-send v-else />
              </template>
              <template #default>
                {{ type === 'edit' ? '保存' : '发布' }}
              </template>
            </a-button>
          </template>
        </a-page-header>
      </a-affix>
    </div>
    <div class="detail_content" style="display: flex; flex-direction: column;">
      <GiForm ref="formRef" v-model="form" :options="options" :columns="columns">
        <template #noticeUsers>
          <a-select
            v-model="form.noticeUsers"
            :options="userList"
            multiple
            :max-tag-count="4"
            :allow-clear="true"
          />
          <a-tooltip content="选择用户">
            <a-button @click="onOpenSelectUser">
              <template #icon>
                <icon-plus />
              </template>
            </a-button>
          </a-tooltip>
        </template>
      </GiForm>
      <div style="flex: 1;">
        <AiEditor v-model="form.content" />
      </div>
    </div>

    <a-modal
      v-model:visible="visible"
      title="用户选择"
      :mask-closable="false"
      :esc-to-close="false"
      :width="width >= 1350 ? 1350 : '100%'"
      draggable
      @close="reset"
    >
      <UserSelect v-if="visible" ref="UserSelectRef" v-model:value="form.noticeUsers" @select-user="onSelectUser" />
    </a-modal>
  </div>
</template>

<script setup lang="tsx">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { ref } from 'vue'
import AiEditor from '../components/edit/index.vue'
import { useTabsStore } from '@/stores'
import { type Columns, GiForm, type Options } from '@/components/GiForm'
import { addNotice, getNotice, updateNotice } from '@/apis/system'
import { useForm } from '@/hooks'
import { useDict } from '@/hooks/app'
import { listUserDict } from '@/apis'
import type { LabelValueState } from '@/types/global'

const { width } = useWindowSize()
const { notice_type } = useDict('notice_type')
const containerRef = ref<HTMLElement | null>()
const tabsStore = useTabsStore()
const route = useRoute()
const formRef = ref<InstanceType<typeof GiForm>>()
const { id, type } = route.query
const { form, resetForm } = useForm({
  title: '',
  type: '',
  effectiveTime: '',
  terminateTime: '',
  content: '',
  noticeScope: 1,
})
const options: Options = {
  form: { size: 'large' },
  grid: { cols: 2 },
  btns: { hide: true },
}

const columns: Columns = reactive([
  {
    label: '标题',
    field: 'title',
    type: 'input',
    props: {
      maxLength: 150,
      showWordLimit: true,
    },
    rules: [{ required: true, message: '请输入标题' }],
  },
  {
    label: '类型',
    field: 'type',
    type: 'select',
    options: notice_type,
    rules: [{ required: true, message: '请输入类型' }],
  },
  {
    label: '生效时间',
    field: 'effectiveTime',
    type: 'date-picker',
    props: {
      showTime: true,
    },
  },
  {
    label: '终止时间',
    field: 'terminateTime',
    type: 'date-picker',
    props: {
      showTime: true,
    },
  },
  {
    label: '通知范围',
    field: 'noticeScope',
    type: 'radio-group',
    options: [{ label: '所有人', value: 1 }, { label: '指定用户', value: 2 }],
    rules: [{ required: true, message: '请选择通知范围' }],
  },
  {
    label: '指定用户',
    field: 'noticeUsers',
    type: 'select',
    hide: () => {
      return form.noticeScope === 1
    },
    rules: [{ required: true, message: '请选择指定用户' }],
  },
])

// 修改
const onUpdate = async (id: string) => {
  resetForm()
  const res = await getNotice(id)
  Object.assign(form, res.data)
}

// 返回
const onBack = () => {
  tabsStore.closeCurrent(route.path)
}

// 发布
const onReleased = async () => {
  const isInvalid = await formRef.value?.formRef?.validate()
  if (isInvalid) return false
  try {
    // 通知范围 所有人 去除指定用户
    form.noticeUsers = form.noticeScope === 1 ? null : form.noticeUsers
    if (type === 'edit') {
      await updateNotice(form, id as string)
      Message.success('修改成功')
    } else {
      await addNotice(form)
      Message.success('新增成功')
    }
    onBack()
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

// 打开用户选择窗口
const visible = ref(false)
const onOpenSelectUser = () => {
  visible.value = true
}

const UserSelectRef = ref()
// 重置
const reset = () => {
  UserSelectRef.value?.onClearSelected()
}

// 用户选择回调
const onSelectUser = (value: string[]) => {
  form.noticeUsers = value
  formRef.value?.formRef?.validateField('noticeUsers')
}

const userList = ref<LabelValueState[]>([])
onMounted(async () => {
  // 当id存在与type为edit时，执行修改操作
  if (id && type === 'edit') {
    onUpdate(id as string)
  }
  // 获取所有用户
  const { data } = await listUserDict()
  userList.value = data
})
</script>

<style scoped lang="less"></style>
