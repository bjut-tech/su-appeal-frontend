<script setup lang="ts">
import { useStore } from '../lib/store'

import avatarPlaceholder from '../assets/images/avatar-placeholder.png?url'

const store = useStore()
</script>

<template>
  <div class="flex flex-col items-stretch py-6 gap-6">
    <van-cell-group inset>
      <van-cell
        size="large"
        icon-prefix="bi"
        icon="person"
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

    <van-cell-group inset>
      <van-cell
        icon-prefix="bi"
        icon="clock-history"
        title="我的历史反馈"
        :value="store.loggedIn ? '' : '登录后可查看'"
        center
        :is-link="store.loggedIn"
        :to="store.loggedIn ? '/user/history' : ''"
        :aria-disabled="!store.loggedIn"
      />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell
        v-if="store.isAdmin"
        icon-prefix="bi"
        icon="gear-wide-connected"
        title="管理员菜单"
        center
        is-link
        to="/admin"
      />
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
