<script setup lang="ts">
import { ref } from 'vue'
import type { PickerConfirmEventParams } from 'vant'

import { campusOptions } from '../types/Campus'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits([
  'update:modelValue'
])

const isShowPicker = ref(false)

const showPicker = (): void => {
  isShowPicker.value = true
}

const onConfirm = (e: PickerConfirmEventParams): void => {
  emit('update:modelValue', e.selectedValues[0] as string)
  isShowPicker.value = false
}
</script>

<template>
  <slot :trigger="showPicker" />
  <van-popup
    v-model:show="isShowPicker"
    round
    position="bottom"
  >
    <van-picker
      title="选择校区"
      :columns="campusOptions"
      @cancel="isShowPicker = false"
      @confirm="onConfirm"
    />
  </van-popup>
</template>
