<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showConfirmDialog, showToast } from 'vant'
import type { ActionSheetAction } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import AnnouncementCarouselShow from '../components/AnnouncementCarouselShow.vue'
import BlockLoading from '../components/BlockLoading.vue'
import type { AnnouncementCarousel } from '../types/announcement.ts'

const router = useRouter()

const {
  data,
  isLoading,
  execute: fetchData
} = useAxios<AnnouncementCarousel[]>('announcements/carousels', useAxiosInstance(), {
  immediate: true,
  initialData: []
})

const actions = ref<ActionSheetAction[]>([
  {
    name: '查看内容',
    callback: () => {
      actionsShow.value = false
      const item = data.value?.find(item => item.id === actionsFor.value)
      if (item) {
        router.push(`/announcements/${item.announcement.id}`)
      }
    }
  },
  {
    name: '移除',
    color: '#ee0a24',
    callback: () => {
      actionsShow.value = false
      if (actionsFor.value !== null) {
        onDelete(actionsFor.value)
      }
    }
  }
])

const actionsFor = ref<number | null>(null)

const actionsShow = ref<boolean>(false)

const onClick = (id: number): void => {
  actionsFor.value = id
  actionsShow.value = true
}

const onDelete = (id: number): void => {
  showConfirmDialog({
    title: '注意',
    message: '确定要移除这则轮播公告吗？此操作不会删除公告内容本身',
    confirmButtonText: '删除',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance().delete(`announcements/carousels/${id}`)
      .catch(() => {
        showToast({
          type: 'fail',
          message: '移除失败'
        })
      })
      .finally(() => {
        fetchData()
      })
  })
}
</script>

<template>
  <div
    v-if="!isLoading"
    class="flex flex-col items-stretch py-6 gap-4"
  >
    <p
      v-if="!data?.length"
      class="text-center px-4 text-sm text-gray-500 dark:text-neutral-400"
    >
      暂无轮播公告，请先回到首页，选取一则公告并设为轮播
    </p>
    <div
      v-else
      class="flex flex-col items-stretch px-4 gap-6"
    >
      <announcement-carousel-show
        v-for="item of data"
        :key="item.id"
        class="rounded-lg"
        :value="item"
        @click="onClick(item.id)"
      />
    </div>
    <van-action-sheet
      teleport="body"
      :show="actionsShow"
      :actions="actions"
      title="管理轮播公告"
      cancel-text="取消"
      :duration="0.2"
      close-on-click-overlay
      safe-area-inset-bottom
      @cancel="actionsShow = false"
      @close="actionsShow = false"
    />
  </div>
  <block-loading v-else />
</template>
