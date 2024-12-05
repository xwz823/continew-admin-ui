<template>
  <a-spin :loading="loading">
    <a-form
        ref="formRef"
        :model="form"
        auto-label-width
        label-align="left"
        :layout="width >= 500 ? 'horizontal' : 'vertical'"
        :disabled="!isUpdate"
        scroll-to-first-error>
      <a-form-item
          field="NEED_CAPTCHA"
          :label="captchaSetting.NEED_CAPTCHA.name"
      >
        <a-switch v-model="form.NEED_CAPTCHA" type="round" :checked-value="1" :unchecked-value="0">
          <template #checked>是</template>
          <template #unchecked>否</template>
        </a-switch>
      </a-form-item>

      <a-space style="margin-bottom: 16px">
        <a-button v-if="!isUpdate" v-permission="['system:config:update']" type="primary" @click="onUpdate">
          <template #icon>
            <icon-edit/>
          </template>
          修改
        </a-button>
        <a-button v-if="!isUpdate" v-permission="['system:config:reset']" @click="onResetValue">
          <template #icon>
            <icon-undo/>
          </template>
          恢复默认
        </a-button>
        <a-button v-if="isUpdate" type="primary" @click="handleSave">
          <template #icon>
            <icon-save/>
          </template>
          保存
        </a-button>
        <a-button v-if="isUpdate" @click="reset">
          <template #icon>
            <icon-refresh/>
          </template>
          重置
        </a-button>
        <a-button v-if="isUpdate" @click="handleCancel">
          <template #icon>
            <icon-undo/>
          </template>
          取消
        </a-button>
      </a-space>
    </a-form>
  </a-spin>
</template>

<script setup lang="ts">
import {useWindowSize} from '@vueuse/core'
import {type FormInstance, Message, Modal} from '@arco-design/web-vue'
import {type CaptchaSetting, listOption, type OptionResp, resetOptionValue, updateOption} from '@/apis/system'
import {useResetReactive} from '@/hooks'

defineOptions({name: 'CaptchaSetting'})
const {width} = useWindowSize()

const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()
const [form] = useResetReactive({
  NEED_CAPTCHA: 1,
})

const captchaSetting = ref<CaptchaSetting>({
  NEED_CAPTCHA: {},
})
// 重置
const reset = () => {
  formRef.value?.resetFields()
  form.NEED_CAPTCHA = captchaSetting.value.NEED_CAPTCHA.value
}

const isUpdate = ref(false)
// 修改
const onUpdate = () => {
  isUpdate.value = true
}

// 取消
const handleCancel = () => {
  reset()
  isUpdate.value = false
}

const queryForm = {
  category: 'CAPTCHA',
}
// 查询列表数据
const getDataList = async () => {
  loading.value = true
  const {data} = await listOption(queryForm)
  captchaSetting.value = data.reduce((obj: CaptchaSetting, option: OptionResp) => {
    obj[option.code] = {...option, value: Number.parseInt(option.value)}
    return obj
  }, {})

  handleCancel()
  loading.value = false
}

// 保存
const handleSave = async () => {
  const isInvalid = await formRef.value?.validate()
  if (isInvalid) return false
  await updateOption(
      Object.entries(form).map(([key, value]) => {
        return {id: captchaSetting.value[key].id, code: key, value}
      }),
  )
  await getDataList()
  Message.success('保存成功')
}

// 恢复默认
const handleResetValue = async () => {
  await resetOptionValue(queryForm)
  Message.success('恢复成功')
  await getDataList()
}
const onResetValue = () => {
  Modal.warning({
    title: '警告',
    content: '确认恢复安全配置为默认值吗？',
    hideCancel: false,
    maskClosable: false,
    onOk: handleResetValue,
  })
}

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss">
:deep(.arco-form-item.arco-form-item-has-help) {
  margin-bottom: 5px;
}

.input-width {
  width: 200px;
}
</style>
