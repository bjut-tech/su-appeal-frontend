<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast } from 'vant'
import type { PickerConfirmEventParams, PickerOption } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import type { QuestionCategory } from '../types/question.ts'

defineProps<{
  modelValue: number | null
}>()

const emit = defineEmits([
  'update:modelValue'
])

const {
  data
} = useAxios<QuestionCategory[]>('questions/categories', useAxiosInstance(), {
  immediate: true,
  onError: (e) => {
    console.error(e)
    showToast({
      type: 'fail',
      message: '加载反馈类别失败'
    })
  }
})

const options = computed<PickerOption[]>(() => {
  const res = [] as PickerOption[]

  if (data.value?.length) {
    data.value.forEach((item) => {
      res.push({
        text: item.name,
        value: item.id
      })
    })
  } else {
    res.push({
      text: '无类别',
      value: 0
    })
  }

  return res
})

const isShowPicker = ref(false)

const showPicker = (): void => {
  isShowPicker.value = true
}

const onConfirm = (e: PickerConfirmEventParams): void => {
  const value = e.selectedValues[0] as number
  if (value === 0) {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', value)
  }
  isShowPicker.value = false
}
</script>

<template>
  <slot :trigger="showPicker" />
  <van-popup
    v-model:show="isShowPicker"
    teleport="body"
    round
    position="bottom"
  >
    <van-picker
      title="选择公告类别"
      :columns="options"
      @cancel="isShowPicker = false"
      @confirm="onConfirm"
    />
  </van-popup>
</template>
