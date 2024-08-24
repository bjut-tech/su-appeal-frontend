<script setup lang="ts">
import { useSorted } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'
import type { Ref } from 'vue'

import { useAxiosInstance } from '../lib/axios.ts'

const { data, error } = useAxios<string[]>('admin/admins', useAxiosInstance(), {
  immediate: true,
  initialData: []
})

const dataSorted = useSorted(data as Ref<string[]>)
</script>

<template>
  <div class="flex flex-col items-stretch py-6 gap-4">
    <van-cell-group inset>
      <van-cell
        v-for="item in dataSorted"
        :key="item"
        :title="item"
      />
      <van-cell
        v-if="error"
        title="加载管理员列表失败"
        title-class="text-red-600"
      />
    </van-cell-group>
    <p
      v-show="data"
      class="px-4 text-xs text-gray-500 dark:text-neutral-400"
    >
      以上账号具有管理员权限。列表仅供参考，如需修改，请编辑服务器配置。
    </p>
  </div>
</template>
