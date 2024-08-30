<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useAxios } from '@vueuse/integrations/useAxios'
import type { ActionSheetAction } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import { useStore } from '../lib/store.ts'
import AnnouncementCarouselShow from '../components/AnnouncementCarouselShow.vue'
import AnnouncementShow from '../components/AnnouncementShow.vue'
import PaginatedList from '../components/PaginatedList.vue'
import type { Announcement, AnnouncementCarousel, AnnouncementCategory } from '../types/announcement.ts'

interface AnnouncementIndexFilter {
  category: number | undefined
  search: string
}

const store = useStore()

const router = useRouter()

const list = ref<Announcement[]>([])

const {
  data: carousels
} = useAxios<AnnouncementCarousel[]>('announcements/carousels', useAxiosInstance(), {
  immediate: true,
  initialData: [],
  onError: (e) => {
    console.error(e)
    showToast({
      type: 'fail',
      message: '加载轮播公告失败'
    })
  }
})

const {
  data: categories
} = useAxios<AnnouncementCategory[]>('announcements/categories', useAxiosInstance(), {
  immediate: true,
  initialData: [],
  onError: (e) => {
    console.error(e)
    showToast({
      type: 'fail',
      message: '加载公告类别失败'
    })
  }
})

const filter = ref<AnnouncementIndexFilter>({
  category: undefined,
  search: ''
})

const toggleFilterCategory = (id?: number): void => {
  filter.value.category = filter.value.category === id ? undefined : id
}

const actions = computed<ActionSheetAction[]>(() => {
  const res = [] as ActionSheetAction[]
  if (!actionsFor.value) {
    return res
  }

  res.push({
    name: '编辑',
    callback: () => {
      actionsShow.value = false
      if (actionsFor.value !== null) {
        router.push(`/announcements/${actionsFor.value}/edit`)
      }
    }
  }, {
    name: '设为轮播',
    callback: () => {
      actionsShow.value = false
      if (actionsFor.value !== null) {
        router.push(`/announcements/carousels/create?announcement=${actionsFor.value}`)
      }
    }
  })

  if (list.value.find((item) => item.id === actionsFor.value)?.pinned) {
    res.push({
      name: '取消置顶',
      callback: () => {
        actionsShow.value = false
        if (actionsFor.value !== null) {
          onUnpin(actionsFor.value)
        }
      }
    })
  } else {
    res.push({
      name: '置顶',
      callback: () => {
        actionsShow.value = false
        if (actionsFor.value !== null) {
          onPin(actionsFor.value)
        }
      }
    })
  }

  res.push({
    name: '删除',
    color: '#ee0a24',
    callback: () => {
      actionsShow.value = false
      if (actionsFor.value !== null) {
        onDelete(actionsFor.value)
      }
    }
  })

  return res
})

const actionsFor = ref<number | null>(null)

const actionsShow = ref<boolean>(false)

const onManage = (id: number): void => {
  actionsFor.value = id
  actionsShow.value = true
}

const onPin = (id: number): void => {
  useAxiosInstance()
    .post(`announcements/${id}/pin`)
    .then(() => {
      showToast({
        type: 'success',
        message: '置顶成功'
      })
      list.value = list.value.map((item) => {
        if (item.id === id) {
          item.pinned = true
        }
        return item
      })
    })
    .catch((e) => {
      console.error(e)
      showToast({
        type: 'fail',
        message: '置顶失败'
      })
    })
}

const onUnpin = (id: number): void => {
  useAxiosInstance()
    .delete(`announcements/${id}/pin`)
    .then(() => {
      showToast({
        type: 'success',
        message: '取消置顶成功'
      })
      list.value = list.value.map((item) => {
        if (item.id === id) {
          item.pinned = false
        }
        return item
      })
    })
    .catch((e) => {
      console.error(e)
      showToast({
        type: 'fail',
        message: '取消置顶失败'
      })
    })
}

const onDelete = (id: number): void => {
  showConfirmDialog({
    title: '注意',
    message: '确定要删除这则公告吗？',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance()
      .delete(`announcements/${id}`)
      .then(() => {
        showToast({
          type: 'success',
          message: '删除成功'
        })
        list.value = list.value.filter((item) => item.id !== id)
      })
      .catch((e) => {
        console.error(e)
        showToast({
          type: 'fail',
          message: '删除失败'
        })
      })
  })
}
</script>

<template>
  <paginated-list
    v-model="list"
    url="announcements"
    :params="filter"
    custom-class="flex flex-col px-4 py-6 gap-4"
    pull-refresh
  >
    <van-swipe
      v-if="carousels?.length"
      class="rounded-lg overflow-hidden"
      loop
      :autoplay="3000"
      indicator-color="white"
    >
      <van-swipe-item
        v-for="item of carousels"
        :key="item.id"
        @click="router.push(`/announcements/${item.announcement.id}`)"
      >
        <announcement-carousel-show :value="item" />
      </van-swipe-item>
    </van-swipe>
    <div
      v-if="categories?.length"
      class="flex gap-2 sm:gap-3 items-stretch"
    >
      <button
        class="flex-1 block px-3 sm:px-4 py-2 bg-white dark:bg-neutral-900 text-xs sm:text-sm rounded-lg"
        :class="{ 'text-gray-500 dark:text-neutral-400': filter.category, 'text-brand': !filter.category }"
        @click="toggleFilterCategory()"
      >
        全部
      </button>
      <button
        v-for="item of categories"
        :key="item.id"
        class="flex-1 block px-3 sm:px-4 py-2 bg-white dark:bg-neutral-900 text-xs sm:text-sm rounded-lg"
        :class="{ 'text-gray-500 dark:text-neutral-400': filter.category !== item.id, 'text-brand': filter.category === item.id }"
        @click="toggleFilterCategory(item.id)"
        v-text="item.name"
      />
    </div>
    <van-field
      v-model="filter.search"
      class="bg-white dark:bg-neutral-900 !text-xs sm:!text-sm text-gray-500 dark:text-neutral-400 !px-3 sm:!px-4 !py-2 rounded-lg"
      :border="false"
      icon-prefix="bi"
      left-icon="search"
      placeholder="搜索公告内容..."
    />
    <announcement-show
      v-for="item of list"
      :key="item.id"
      :announcement="item"
      :show-category="!filter.category"
      :show-manage="store.isAdmin"
      @manage="onManage(item.id)"
    />
    <van-action-sheet
      teleport="body"
      :show="actionsShow"
      title="管理公告"
      :actions="actions"
      cancel-text="取消"
      :duration="0.2"
      close-on-click-overlay
      safe-area-inset-bottom
      @cancel="actionsShow = false"
      @close="actionsShow = false"
    />
  </paginated-list>
</template>
