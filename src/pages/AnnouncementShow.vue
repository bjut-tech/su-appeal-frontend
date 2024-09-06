<script setup lang="ts">
import { onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import AnnouncementShowComponent from '../components/AnnouncementShow.vue'
import BlockLoading from '../components/BlockLoading.vue'
import type { Announcement } from '../types/announcement.ts'

const route = useRoute()

const router = useRouter()

const {
  data: announcement,
  isLoading,
  execute: fetchData
} = useAxios<Announcement>('', useAxiosInstance(), {
  immediate: false,
  onError: (e: any) => {
    console.error(e)
    if (e?.response?.status && e.response.status >= 400) {
      router.replace('/not-found')
    } else {
      showToast({
        type: 'fail',
        message: '加载失败',
        onClose: () => {
          router.back()
        }
      })
    }
  }
})

onBeforeRouteUpdate((to, from) => {
  if (to.params.id === from.params.id) {
    return
  }

  fetchData(`announcements/${to.params.id}`)
})

onMounted(() => {
  fetchData(`announcements/${route.params.id}`)
})
</script>

<template>
  <div class="flex flex-col items-stretch px-4 py-6 gap-4">
    <block-loading v-if="isLoading || !announcement" />
    <announcement-show-component
      v-else
      :announcement="announcement"
      show-category
      no-collapse
    />
  </div>
</template>
