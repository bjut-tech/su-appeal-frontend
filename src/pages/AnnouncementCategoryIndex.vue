<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAxios } from '@vueuse/integrations/useAxios'
import { showConfirmDialog, showToast } from 'vant'
import type { ActionSheetAction } from 'vant'

import { useAxiosInstance } from '../lib/axios.ts'
import { useCallbackStore } from '../lib/store.ts'
import type { AnnouncementCategory } from '../types/announcement.ts'

const route = useRoute()

const router = useRouter()

const callbackStore = useCallbackStore()

const isChoose = computed<boolean>(() => {
  return !!route.query.choose
})

const {
  data,
  execute: fetchData
} = useAxios<AnnouncementCategory[]>('announcements/categories', useAxiosInstance(), {
  immediate: true,
  initialData: []
})

const actions = ref<ActionSheetAction[]>([
  {
    name: '编辑',
    callback: () => {
      if (actionsFor.value !== null) {
        onEdit(actionsFor.value)
        actionsFor.value = null
      }
    }
  },
  {
    name: '删除',
    color: '#ee0a24',
    callback: () => {
      if (actionsFor.value !== null) {
        onDelete(actionsFor.value)
        actionsFor.value = null
      }
    }
  }
])

const actionsFor = ref<number | null>(null)

const editing = ref<number | boolean>(false)

const editingForm = ref<Partial<AnnouncementCategory>>({
  name: '',
  description: ''
})

const editingErrors = ref<Record<string, string>>({})

const onChoose = (id: number): void => {
  if (isChoose.value) {
    callbackStore.selectedCategory = id
    callbackStore.hasSelectedCategory = true
    router.back()
  } else {
    actionsFor.value = id
  }
}

const onEdit = (id: number): void => {
  const category = data.value?.find((item) => item.id === id)
  if (category) {
    editingForm.value = {
      name: category.name,
      description: category.description
    }
    editingErrors.value = {}
    editing.value = category.id
  }
}

const onDelete = (id: number): void => {
  showConfirmDialog({
    title: '注意',
    message: '确定要删除这个公告类别吗？',
    confirmButtonText: '删除',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    useAxiosInstance()
      .delete(`announcements/categories/${id}`)
      .catch(() => {
        showToast({
          type: 'fail',
          message: '删除失败'
        })
      })
      .finally(() => {
        fetchData()
      })
  })
}

const onCreate = (): void => {
  editingForm.value = {
    name: '',
    description: ''
  }
  editingErrors.value = {}
  editing.value = true
}

const onSaveEdit = (): void => {
  editingErrors.value = {}
  if (!editingForm.value.name?.trim()) {
    editingErrors.value.name = '不能为空'
    return
  }

  if (editing.value === true) {
    useAxiosInstance()
      .post('announcements/categories', {
        name: editingForm.value.name,
        description: editingForm.value.description
      })
      .then(() => {
        showToast({
          type: 'success',
          message: '创建成功'
        })
      })
      .catch(() => {
        showToast({
          type: 'fail',
          message: '保存失败'
        })
      })
      .finally(() => {
        fetchData()
      })
  } else {
    useAxiosInstance()
      .patch(`announcements/categories/${editing.value}`, {
        name: editingForm.value.name,
        description: editingForm.value.description
      })
      .then(() => {
        showToast({
          type: 'success',
          message: '保存成功'
        })
      })
      .catch(() => {
        showToast({
          type: 'fail',
          message: '保存失败'
        })
      })
      .finally(() => {
        fetchData()
      })
  }
  editing.value = false
}

const onCancelEdit = (): void => {
  editing.value = false
}

const onCancel = (): void => {
  callbackStore.selectedCategory = null
  callbackStore.hasSelectedCategory = true
  router.back()
}
</script>

<template>
  <div class="flex flex-col items-stretch py-6 gap-4">
    <p
      v-if="!data?.length"
      class="text-center px-4 text-sm text-gray-500 dark:text-neutral-400"
    >
      暂无公告类别，请先创建
    </p>
    <p
      v-else-if="isChoose"
      class="px-4 text-sm text-gray-500 dark:text-neutral-400"
    >
      请选择要发布的公告类别，左划可编辑
    </p>
    <van-cell-group
      v-if="data?.length"
      inset
    >
      <van-swipe-cell
        v-for="item in data"
        :key="item.id"
      >
        <van-cell
          icon-prefix="bi"
          icon="pencil-square"
          :title="item.name"
          is-link
          center
          @click="onChoose(item.id)"
        />
        <template #right>
          <van-button
            square
            type="warning"
            text="编辑"
            @click="onEdit(item.id)"
          />
          <van-button
            square
            type="danger"
            text="删除"
            @click="onDelete(item.id)"
          />
        </template>
      </van-swipe-cell>
    </van-cell-group>
    <div class="flex justify-evenly items-stretch px-4 gap-4">
      <van-button
        v-if="isChoose"
        class="dark:border-neutral-800"
        type="default"
        block
        icon-prefix="bi"
        icon="x-lg"
        @click="onCancel"
      >
        取消选择
      </van-button>
      <van-button
        type="primary"
        icon-prefix="bi"
        icon="plus-lg"
        block
        @click="onCreate"
      >
        创建新类别
      </van-button>
    </div>
    <van-popup
      :show="editing !== false"
      position="bottom"
      round
      close-on-popstate
      :duration="0.2"
      :close-on-click-overlay="false"
      safe-area-inset-bottom
    >
      <div class="flex items-center">
        <button
          class="flex-shrink-0 text-gray-500 dark:text-neutral-400 text-sm cursor-pointer px-6 py-2"
          @click="onCancelEdit"
        >
          取消
        </button>
        <h5 class="flex-1 text-lg font-medium text-center py-2">
          {{ typeof editing === 'number' ? '编辑' : '创建' }}公告类别
        </h5>
        <button
          class="flex-shrink-0 text-brand text-sm cursor-pointer px-6 py-2"
          @click="onSaveEdit"
        >
          保存
        </button>
      </div>
      <van-cell-group
        class="!my-4"
        inset
      >
        <van-field
          v-model="editingForm.name"
          type="text"
          label="名称"
          placeholder="请输入类别名称"
          value-class="text-semibold"
          :error="!!editingErrors.name"
          :error-message="editingErrors.name"
          maxlength="85"
          autocomplete="off"
        />
        <van-field
          v-model="editingForm.description"
          type="text"
          label="备注"
          placeholder="选填"
          :error="!!editingErrors.description"
          :error-message="editingErrors.description"
          maxlength="10000"
          autocomplete="off"
        />
      </van-cell-group>
    </van-popup>
    <van-action-sheet
      :show="actionsFor !== null"
      :actions="actions"
      cancel-text="取消"
      :duration="0.2"
      close-on-click-overlay
      safe-area-inset-bottom
      @cancel="actionsFor = null"
      @close="actionsFor = null"
    />
  </div>
</template>
