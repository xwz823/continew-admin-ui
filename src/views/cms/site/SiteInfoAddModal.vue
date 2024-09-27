<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :modal-style="{ maxWidth: '520px' }"
    width="90%"
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :options="options" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { getSiteInfo, addSiteInfo, updateSiteInfo } from '@/apis/cms/site'
import  type{ Columns,Options} from '@/components/GiForm'
import { GiForm } from '@/components/GiForm'
import { useForm } from '@/hooks'
import { useDict } from '@/hooks/app'
import type { LanguagesResp } from '@/apis/system/language'
import { listLanguages } from '@/apis/system/language'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const dataId = ref('')
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改站点' : '新增站点'))
const formRef = ref<InstanceType<typeof GiForm>>()
const languages = ref<LanguagesResp[]>([])

const options: Options = {
  form: {},
  col: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
  btns: { hide: true }
}

const columns: Columns = reactive([
  {
    label: '站点名称',
    field: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入站点名称' }]
  },
  {
    label: '绑定域名',
    field: 'bindDomain',
    type: 'input',
    rules: [{ required: true, message: '请输入绑定域名' }]
  },
  {
    label: '二级目录',
    field: 'bindPath',
    type: 'input',
    rules: [{ required: false, message: '请输入二级目录' }]
  },
  {
    label: '绑定语言',
    field: 'bindLangs',
    type: 'select', 
    options: languages.value,
    rules: [{ required: false, message: '请选择绑定语言' }]
  },
])

const { form, resetForm } = useForm({
    // todo 待补充
})

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

const visible = ref(false)
// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
  languages.value = (await listLanguages({size: 999})).data.list
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const res = await getSiteInfo(id)
  Object.assign(form, res.data)
  visible.value = true
  languages.value = (await listLanguages({size: 999})).data.list
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateSiteInfo(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addSiteInfo(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

defineExpose({ onAdd, onUpdate })
</script>
