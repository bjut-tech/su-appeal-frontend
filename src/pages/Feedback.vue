<script setup lang="ts">
import { showImagePreview } from 'vant'

import qrWechat from '../assets/images/wechat.svg?inline'

const showQrWechat = (): void => {
  showImagePreview({
    images: [qrWechat],
    showIndex: false,
    loop: false,
    doubleScale: false,
    maxZoom: 1,
    closeable: true
  })
}
</script>

<template>
  <div class="flex flex-col items-stretch py-6 gap-4">
    <van-cell-group inset>
      <div class="p-4 text-xs text-gray-500 dark:text-neutral-400">
        <p>如果你在使用此应用的过程中遇到了问题，可以通过以下方式联系开发者，我们会第一时间处理！</p>
      </div>
      <van-cell
        icon-prefix="bi"
        icon="wechat"
        title="微信"
        center
        is-link
        @click="showQrWechat"
      >
        <template #value>
          <span>JingBh_</span>
          <i class="bi bi-qr-code ml-2" />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>
