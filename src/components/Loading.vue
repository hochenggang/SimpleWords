<template>
  <transition name="slide-fade">
    <div v-if="loadingVisible" class="loading fixed-full flex-center">
      <p v-if="noteVisible" class="note-text">Sorry, Try later.</p>
      <p v-if="!noteVisible">Loading...</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";


const props = defineProps<{
  count: number,
  after: number,
}>()


const count = ref(0)
const loadingVisible = ref(false)
const noteVisible = ref(false)
let loadingTimeoutId = 0
let loadingTimestamp = 0

watch(props, () => {
  if (props.count != count.value) {
    count.value = props.count
  }
  if (props.count == -1) {
    noteVisible.value = true
  }

})

watch(count, () => {

  if (!loadingTimeoutId && count.value > 0) {
    console.log("Loading -> loading start")
    loadingTimestamp = new Date().getTime()
    loadingTimeoutId = setTimeout(() => {
      loadingVisible.value = true
    }, props.after);
  }
  if (loadingTimeoutId && count.value == 0) {
    // console.log('Loading -> time difference ', new Date().getTime() - loadingTimestamp, ' loading timeout id', loadingTimeoutId)
    if (new Date().getTime() - loadingTimestamp < props.after) {
      console.log("Loading -> undo loading")
      clearTimeout(loadingTimeoutId)
    }
    loadingTimeoutId = 0
    loadingVisible.value = false
  }
  loadingTimestamp = new Date().getTime()
})

</script>

<style scoped>
.fixed-full {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2147483647;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  flex-direction: column;
}

.loading {
  background-color: var(--color-bg);
  opacity: 0.9;
}

.loading-icon {
  width: 3rem;
  height: 3rem;
  stroke: var(--color-line);
  fill: var(--color-line);
  animation: rotate 3s linear infinite;
}


@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>