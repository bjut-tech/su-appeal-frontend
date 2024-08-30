<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAxios } from '@vueuse/integrations/useAxios'

import { useAxiosInstance } from '../lib/axios.ts'
import { getCampusName } from '../lib/campus.ts'
import { useStore } from '../lib/store.ts'
import CampusSelect from '../components/CampusSelect.vue'
import PaginatedList from '../components/PaginatedList.vue'
import QuestionShowComponent from '../components/QuestionShow.vue'
import type { Question } from '../types/question.ts'

interface QuestionIndexFilter {
  status: string
  campus: string
  search: string
}

defineProps<{
  history?: boolean
}>()

const route = useRoute()

const store = useStore()

const list = ref<Question[]>([])

const {
  data: listLiked,
  execute: fetchListLiked
} = useAxios<number[]>('questions/liked-answers', useAxiosInstance(), {
  initialData: [],
  immediate: false
})

const filter = ref<QuestionIndexFilter>({
  status: '',
  campus: '',
  search: ''
})

const toggleFilterStatus = (status?: string): void => {
  filter.value.status = filter.value.status === status ? '' : (status ?? '')
}

const onPublish = (id: number): void => {
  list.value = list.value.map((item) => {
    if (item.id === id) {
      item.published = true
    }
    return item
  })
}

const onUnpublish = (id: number): void => {
  list.value = list.value.map((item) => {
    if (item.id === id) {
      item.published = false
    }
    return item
  })
}

const onLike = (id: number): void => {
  if (!listLiked.value) {
    listLiked.value = []
  }

  list.value = list.value.map((item) => {
    if (item.id === id && item.answer) {
      item.answer.likesCount++
      listLiked.value?.push(item.answer.id)
    }
    return item
  })
}

const onUnlike = (id: number): void => {
  list.value = list.value.map((item) => {
    if (item.id === id && item.answer) {
      item.answer.likesCount--
      if (item.answer.likesCount < 0) {
        item.answer.likesCount = 0
      }

      listLiked.value = (listLiked.value ?? []).filter((item1) => {
        return item1 !== item.answer?.id
      })
    }
    return item
  })
}

const onDelete = (id: number): void => {
  list.value = list.value.filter((item) => item.id !== id)
}

onMounted(() => {
  if (store.loggedIn) {
    fetchListLiked()
  }

  if (route.query.status &&
    typeof route.query.status === 'string' &&
    store.isAdmin &&
    ['not_replied', 'not_published', 'published'].includes(route.query.status)) {
    filter.value.status = route.query.status
  }
})
</script>

<template>
  <paginated-list
    ref="listComponent"
    v-model="list"
    :url="history ? 'questions/history' : 'questions'"
    :params="history ? undefined : filter"
    custom-class="flex flex-col px-4 py-6 gap-4"
    pull-refresh
  >
    <div
      v-if="store.isAdmin && !history"
      class="flex gap-2 sm:gap-3 items-stretch"
    >
      <button
        class="flex-1 block px-3 sm:px-4 py-2 bg-white dark:bg-neutral-900 text-xs sm:text-sm rounded-lg"
        :class="{ 'text-gray-500 dark:text-neutral-400': filter.status, 'text-brand': !filter.status }"
        @click="toggleFilterStatus()"
      >
        全部
      </button>
      <button
        class="flex-1 block px-3 sm:px-4 py-2 bg-white dark:bg-neutral-900 text-xs sm:text-sm rounded-lg"
        :class="{ 'text-gray-500 dark:text-neutral-400': filter.status !== 'not_replied', 'text-red-500': filter.status === 'not_replied' }"
        @click="toggleFilterStatus('not_replied')"
      >
        未回复
      </button>
      <button
        class="flex-1 block px-3 sm:px-4 py-2 bg-white dark:bg-neutral-900 text-xs sm:text-sm rounded-lg"
        :class="{ 'text-gray-500 dark:text-neutral-400': filter.status !== 'not_published', 'text-orange-500': filter.status === 'not_published' }"
        @click="toggleFilterStatus('not_published')"
      >
        未公布
      </button>
      <button
        class="flex-1 block px-3 sm:px-4 py-2 bg-white dark:bg-neutral-900 text-xs sm:text-sm rounded-lg"
        :class="{ 'text-gray-500 dark:text-neutral-400': filter.status !== 'published', 'text-green-500': filter.status === 'published' }"
        @click="toggleFilterStatus('published')"
      >
        已公布
      </button>
    </div>
    <div
      v-if="!history"
      class="flex gap-2 sm:gap-3 items-stretch"
    >
      <campus-select
        v-slot="{ trigger }"
        v-model="filter.campus"
      >
        <button
          class="flex-shrink-0 inline-flex gap-1 items-center px-3 sm:px-4 py-2 bg-white dark:bg-neutral-900 text-xs sm:text-sm rounded-lg"
          :class="{ 'text-brand': filter.campus, 'text-gray-500 dark:text-neutral-400': !filter.campus }"
          @click="filter.campus ? filter.campus = '' : trigger()"
        >
          <i class="bi bi-funnel" />
          {{ filter.campus ? getCampusName(filter.campus) : '校区' }}
        </button>
      </campus-select>
      <van-field
        v-model="filter.search"
        class="bg-white dark:bg-neutral-900 !text-xs sm:!text-sm text-gray-500 dark:text-neutral-400 !px-3 sm:!px-4 !py-2 rounded-lg"
        :border="false"
        icon-prefix="bi"
        left-icon="search"
        placeholder="搜索反馈内容..."
      />
    </div>
    <!--              | history    | published | all (admin)
    --- show          | true       | false     | true
    --- showUser      | false      | admin     | true
    --- showPublished | true       | admin     | true
    --- fullContent   | false      | true      | published
    --- allowDelete   | !published | false     | !published
    --- allowPublish  | false      | admin     | answered
    -->
    <question-show-component
      v-for="item in list"
      :key="item.id"
      :question="item"
      :answer-liked="listLiked?.includes(item.answer?.id ?? -1)"
      :show-user="!history && store.isAdmin"
      :show-published="history || store.isAdmin"
      :hide-campus="!!filter.campus"
      :full-content="!history && !store.isAdmin && item.published"
      :allow-answer="store.isAdmin"
      :allow-show="history || store.isAdmin"
      :allow-delete="!item.published && (history || store.isAdmin)"
      :allow-publish="!history && store.isAdmin && !!item.answer"
      @publish="onPublish(item.id)"
      @unpublish="onUnpublish(item.id)"
      @like="onLike(item.id)"
      @unlike="onUnlike(item.id)"
      @delete="onDelete(item.id)"
    />
  </paginated-list>
</template>
