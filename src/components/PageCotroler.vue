<script setup lang="ts">
import { ref, defineEmits, computed, defineProps, onMounted } from "vue";
import IconArrayLeft from "./icons/arrayLeft.vue";
import IconArrayRight from "./icons/arrayRight.vue";

const props = defineProps({
  leftArrayVisible: {
    type: Boolean,
    default: true,
  },
  rightArrayVisible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: "setPageIndex", num: number): void;
}>();
</script>

<template>
  <div class="bar bottom-bar shadow">
    <div class="buttons">
      <!-- page - -->
      <span
        class="button"
        v-if="leftArrayVisible"
        @click="emit('setPageIndex', -1)"
      >
        <IconArrayLeft />
      </span>
      <!-- a button for keep position without function -->
      <span
        class="false-button"
        v-if="!rightArrayVisible || !leftArrayVisible"
      ></span>
      <!-- page + -->
      <span
        class="button"
        v-if="rightArrayVisible"
        @click="emit('setPageIndex', 1)"
      >
        <IconArrayRight />
      </span>
    </div>
  </div>
</template>
