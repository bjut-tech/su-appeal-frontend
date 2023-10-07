<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'

import { useAxiosInstance } from '../lib/axios'
import filesize from '../utils/filesize'

const {
  data,
  error,
  execute
} = useAxios<{
  cpuUsage: number
  memoryUsage: number
  memoryUsed: number
  memoryMax: number
  diskUsage: number
  diskFree: number
  diskTotal: number
}>('admin/server/status', useAxiosInstance(), {
  immediate: false
})

useIntervalFn(() => {
  execute()
}, 1000 * 2, {
  immediate: true,
  immediateCallback: true
})
</script>

<template>
  <div class="flex flex-col items-stretch py-6 px-4 gap-4">
    <div class="flex flex-col items-stretch gap-2 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow">
      <div class="flex justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <h2 class="font-semibold">
          CPU
        </h2>
        <p v-if="data">
          {{ Math.round(data.cpuUsage * 1000) / 10 }}%
        </p>
        <p v-else-if="!error">
          获取中...
        </p>
        <p
          v-else
          class="text-red-600"
        >
          获取失败
        </p>
      </div>
      <div
        class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"
        :class="{ 'animate-pulse': !data }"
      >
        <div
          v-if="data"
          class="bg-blue-600 h-2 rounded-full transition-[width] ease-in-out duration-500"
          :style="{ width: data.cpuUsage * 100 + '%' }"
        />
      </div>
    </div>

    <div class="flex flex-col items-stretch gap-2 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow">
      <div class="flex justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <h2 class="font-semibold">
          内存
        </h2>
        <p v-if="data">
          {{ Math.round(data.memoryUsage * 1000) / 10 }}%
        </p>
        <p v-else-if="!error">
          获取中...
        </p>
        <p
          v-else
          class="text-red-600"
        >
          获取失败
        </p>
      </div>
      <div
        class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"
        :class="{ 'animate-pulse': !data }"
      >
        <div
          v-if="data"
          class="bg-blue-600 h-2 rounded-full transition-[width] ease-in-out duration-500"
          :style="{ width: data.memoryUsage * 100 + '%' }"
        />
      </div>
      <div
        v-if="data"
        class="flex justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
      >
        <p>已用 {{ filesize(data.memoryUsed) }}</p>
        <p>共 {{ filesize(data.memoryMax) }}</p>
      </div>
    </div>

    <div class="flex flex-col items-stretch gap-2 p-4 bg-white dark:bg-neutral-900 rounded-lg shadow">
      <div class="flex justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <h2 class="font-semibold">
          硬盘
        </h2>
        <p v-if="data">
          {{ Math.round(data.diskUsage * 1000) / 10 }}%
        </p>
        <p v-else-if="!error">
          获取中...
        </p>
        <p
          v-else
          class="text-red-600"
        >
          获取失败
        </p>
      </div>
      <div
        class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"
        :class="{ 'animate-pulse': !data }"
      >
        <div
          v-if="data"
          class="bg-blue-600 h-2 rounded-full transition-[width] ease-in-out duration-500"
          :style="{ width: data.diskUsage * 100 + '%' }"
        />
      </div>
      <div
        v-if="data"
        class="flex justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
      >
        <p>可用 {{ filesize(data.diskFree) }}</p>
        <p>共 {{ filesize(data.diskTotal) }}</p>
      </div>
    </div>
  </div>
</template>
