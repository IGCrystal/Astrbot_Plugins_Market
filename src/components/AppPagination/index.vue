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
        <template #goto-icon>
          <span class="sr-only">确认跳转</span>
        </template>
      </n-pagination>
    </div>
  </footer>
</template>

<script setup>
import { NPagination } from 'naive-ui'
import { usePagination } from './usePagination'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    default: 'medium'
  }
})

const emit = defineEmits(['update:modelValue'])

const {
  paginationRef,
  quickJumperId,
  gotoLabelId,
  showQuickJumper,
  pageSlot,
  handlePageChange
} = usePagination(props, emit)
</script>

<style scoped src="./AppPaginationStyles.css"></style>
