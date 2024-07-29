<script setup lang="ts">
import { computed } from 'vue'
import { useAxios } from '@vueuse/integrations/useAxios'

import { useAxiosInstance } from '../lib/axios'
import { useSchool } from '../lib/school'

interface ActuatorInfo {
  build?: {
    artifact: string
    name: string
    time: string
    version: string
    group: string
  }
}

const school = useSchool()

const { data } = useAxios<ActuatorInfo>('actuator/info', useAxiosInstance(), {
  immediate: true
})

const version = computed(() => {
  if (data.value?.build?.version) {
    return 'v' + data.value.build.version
  }

  return ''
})
</script>

<template>
  <div class="flex flex-col items-center gap-8 px-4 py-20">
    <div class="flex gap-4 items-stretch">
      <van-image
        class="w-32 h-32 bg-white"
        round
        fit="fill"
        :src="school.logo"
      />
    </div>
    <div class="flex flex-col items-center gap-2">
      <h1 class="text-2xl">
        <span class="font-bold">{{ school.name }}权益墙</span>
        <span
          v-if="version"
          class="ml-2 text-sm text-gray-500 dark:text-neutral-400"
          v-text="version"
        />
      </h1>
      <p class="text-gray-500 dark:text-neutral-400">
        北京工业大学{{ school.name }}学生会权益部
      </p>
    </div>
  </div>
</template>
