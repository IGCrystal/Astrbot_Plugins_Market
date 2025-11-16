<template>
  <footer class="pagination-wrapper" v-if="totalPages > 1">
    <div class="pagination-container">
      <n-pagination
        :page="modelValue"
        :page-count="totalPages"
        @update:page="handlePageChange"
        :size="size"
        :show-size-picker="false"
        :show-quick-jumper="showQuickJumper"
        :page-slot="pageSlot"
        :simple="isSimple"
        aria-label="页面导航"
        ref="paginationRef"
      >
        <template #goto>
          <label
            :id="gotoLabelId"
            class="sr-only"
            :for="quickJumperId"
          >跳转到</label>
        </template>
      </n-pagination>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { NPagination } from 'naive-ui'
import { usePagination } from './usePagination'

type PaginationSize = 'small' | 'medium' | 'large'

const props = withDefaults(defineProps<{
  modelValue: number
  totalPages: number
  size?: PaginationSize
}>(), {
  size: 'medium'
})

const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const {
  paginationRef,
  quickJumperId,
  gotoLabelId,
  showQuickJumper,
  pageSlot,
  isSimple,
  handlePageChange
} = usePagination(props, emit)
</script>

<style scoped src="./AppPaginationStyles.css"></style>
