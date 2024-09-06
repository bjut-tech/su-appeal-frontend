<script setup lang="ts">
import { useAxios } from '@vueuse/integrations/useAxios'

import { useAxiosInstance } from '../lib/axios.ts'
import { useStore } from '../lib/store.ts'

import avatarPlaceholder from '../assets/images/avatar-placeholder.png?url'

const store = useStore()

const { data: count } = useAxios<{
  history?: number
  unreplied?: number
}>('questions/count', useAxiosInstance(), {
  immediate: true
})
</script>

<template>
  <div class="flex flex-col items-stretch py-6 gap-6">
    <van-cell-group inset>
      <van-cell
        size="large"
        :title="store.user?.name || '匿名用户'"
        :label="store.user?.uid"
        center
      >
        <template #icon>
          <van-image
            class="w-14 h-14 mr-3"
            round
            fit="fill"
            :src="avatarPlaceholder"
          />
        </template>
      </van-cell>
      <van-cell
        v-if="store.loggedIn"
        icon-prefix="bi"
        icon="box-arrow-left"
        title="退出登录"
        center
        is-link
        @click="store.logout()"
      />
      <van-cell
        v-else
        icon-prefix="bi"
        icon="box-arrow-in-right"
        title="登录"
        center
        is-link
        to="/login"
      />
    </van-cell-group>

    <van-cell-group
      v-if="store.isAdmin"
      inset
    >
      <van-cell
        icon-prefix="bi"
        icon="megaphone"
        title="发布公告"
        center
        is-link
        to="/announcements/create"
      />
      <van-cell
        icon-prefix="bi"
        icon="inbox"
        title="公告类别管理"
        center
        is-link
        to="/announcements/categories"
      />
      <van-cell
        icon-prefix="bi"
        icon="images"
        title="公告轮播管理"
        center
        is-link
        to="/announcements/carousels"
      />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell
        v-if="store.isAdmin"
        icon-prefix="bi"
        icon="chat-left-text"
        title="回复反馈"
        center
        is-link
        to="/questions?status=not_replied"
      >
        <template #value>
          <span
            v-if="count?.unreplied"
            class="text-red-500"
          >{{ count?.unreplied }}条待回复</span>
        </template>
      </van-cell>
      <van-cell
        icon-prefix="bi"
        icon="clock-history"
        title="我的历史反馈"
        :value="count?.history || ''"
        center
        is-link
        to="/user/history"
      />
    </van-cell-group>

    <van-cell-group
      v-if="store.isAdmin"
      inset
    >
      <van-cell
        icon-prefix="bi"
        icon="people"
        title="管理员列表"
        center
        is-link
        to="/admin/admins"
      />
      <van-cell
        icon-prefix="bi"
        icon="hdd"
        title="服务器状态"
        center
        is-link
        to="/admin/server-status"
      />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell
        icon-prefix="bi"
        icon="info-circle"
        title="关于"
        center
        is-link
        to="/about"
      />
    </van-cell-group>
  </div>
</template>
