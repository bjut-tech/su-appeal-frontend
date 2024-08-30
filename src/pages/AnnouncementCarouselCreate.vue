<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { watchThrottled } from '@vueuse/core'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showToast } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import AnnouncementCarouselShow from '../components/AnnouncementCarouselShow.vue'
import AnnouncementShow from '../components/AnnouncementShow.vue'
import AttachmentUpload from '../components/AttachmentUpload.vue'
import BlockLoading from '../components/BlockLoading.vue'
import type { Announcement, AnnouncementAutocompleteItem, AnnouncementCarousel } from '../types/announcement.ts'
import type { Attachment } from '../types/attachment.ts'

interface AnnouncementCarouselCreateForm {
  announcement: number | null
  cover: Attachment | null
}

const route = useRoute()

const router = useRouter()

const form = ref<AnnouncementCarouselCreateForm>({
  announcement: null,
  cover: null
})

const {
  data: announcement,
  isLoading: isAnnouncementLoading,
  execute: fetchAnnouncement
} = useAxios<Announcement>('', useAxiosInstance(), {
  immediate: false,
  onError: (e) => {
    console.error(e)
    showToast({
      type: 'fail',
      message: '加载失败'
    })
  }
})

const announcementsAutocomplete = ref<AnnouncementAutocompleteItem[]>([])

const announcementsAutocompleteSearch = ref('')

const preview = computed<AnnouncementCarousel | null>(() => {
  if (!form.value.announcement || !announcement.value) {
    return null
  }

  return {
    id: 0,
    announcement: announcement.value,
    cover: form.value.cover
  }
})

const {
  isLoading: isSubmitting,
  execute: submit
} = useAxios('', useAxiosInstance(), {
  immediate: false,
  onSuccess: () => {
    showToast({
      type: 'success',
      message: '保存成功'
    })
    router.replace('/announcements/carousels')
  },
  onError: (e) => {
    console.error(e)
    showToast({
      type: 'fail',
      message: '保存失败'
    })
  }
})

const onSubmit = (): void => {
  if (!form.value.announcement || !announcement.value) {
    return
  }

  submit('announcements/carousels', {
    method: 'POST',
    data: {
      announcement: form.value.announcement,
      cover: form.value.cover?.id ?? null
    }
  })
}

watch(() => route.query.announcement, (v) => {
  form.value.announcement = v ? Number(v) : null
}, {
  immediate: true
})

watch(() => form.value.announcement, (v) => {
  if (v) {
    fetchAnnouncement(`announcements/${v}`)
  } else {
    announcementsAutocompleteSearch.value = ''
  }
}, {
  immediate: true
})

watchThrottled(announcementsAutocompleteSearch, (v) => {
  useAxiosInstance().get<AnnouncementAutocompleteItem[]>('announcements/autocomplete', {
    params: {
      search: v
    }
  }).then(({ data }) => {
    announcementsAutocomplete.value = data
  }).catch((e) => {
    console.error(e)
    announcementsAutocomplete.value = []
  })
}, {
  immediate: true,
  throttle: 500
})
</script>

<template>
  <div class="flex flex-col items-stretch pb-6">
    <van-cell-group
      inset
      title="添加的轮播图将链接到："
    >
      <block-loading v-if="isAnnouncementLoading" />
      <template v-else-if="form.announcement && announcement">
        <announcement-show
          class="van-hairline--bottom"
          :announcement="announcement"
          show-category
        />
        <van-cell
          icon-prefix="bi"
          icon="x-lg"
          title="取消选择"
          is-link
          center
          @click="form.announcement = null"
        />
      </template>
      <template v-else>
        <van-field
          v-model="announcementsAutocompleteSearch"
          icon-prefix="bi"
          left-icon="search"
          placeholder="搜索公告..."
        />
        <van-cell
          v-for="item of announcementsAutocomplete"
          :key="item.id"
          :title="item.title"
          :label="item.content"
          is-link
          center
          @click="form.announcement = item.id"
        />
      </template>
    </van-cell-group>
    <attachment-upload
      title="封面图（建议比例：32/9）"
      :model-value="form.cover ? [form.cover] : []"
      :allow-file="false"
      :allow-multiple="false"
      @update:model-value="form.cover = $event[0] ?? null"
    />
    <van-cell-group
      v-if="preview"
      inset
      title="预览"
    >
      <announcement-carousel-show :value="preview" />
    </van-cell-group>
    <div
      v-if="form.announcement && announcement"
      class="flex justify-evenly items-stretch mt-4 px-4 gap-4"
    >
      <van-button
        type="primary"
        block
        icon-prefix="bi"
        icon="floppy"
        :loading="isSubmitting"
        @click="onSubmit"
      >
        保存
      </van-button>
    </div>
  </div>
</template>
