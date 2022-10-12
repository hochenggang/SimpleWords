<template>
  <ul class="word-list">
    <li class="word-item" v-on:click="setWord(word)" v-for="word in wordListContentKeys" :key="word">
      <span class="word-text">{{ word }}</span>
      <span class="small-text">{{ wordListContent[word] > 0 ? '复' : '新' }}</span>
    </li>
    <p class="fixed-full flex-center note-text" v-if="!wordListContentKeys.length">
      All done.
    </p>
  </ul>
</template>

<script setup lang="ts">

import { computed, watch } from 'vue';
import { wordListContent, wordListLimit, currentWord, REQUESTING_COUNT, currentWordDetail } from '../shared';
import { getWord } from '../query';

const wordListContentKeys = computed(() => Object.keys(wordListContent.value));

const doGetWordDetail = (wordName: string) => {
  // remove before detail
  currentWordDetail.value = null;
  getWord(currentWord.value)
    .then((res) => res.json())
    .then((json) => {
      currentWordDetail.value = json;
      console.log('ok, load detail -> ', wordName, currentWordDetail.value)
    })
    .catch((err) => {
      console.log('error:', err);
      currentWordDetail.value = null;
      delete wordListContent.value[currentWord.value];
      // alert(`${currentWord.value}\nnot available.\n`);
    })
    .finally(() => REQUESTING_COUNT.value -= 1)
}

const setWord = (wordName: string) => {
  if (wordName == currentWord.value) {
    doGetWordDetail(currentWord.value);
  }
  currentWord.value = wordName;
}

watch(currentWord, () => {
  doGetWordDetail(currentWord.value);
})

</script>

<style scoped>
.word-list {
  padding: 3.5rem 0.5rem;
}

.word-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem 0.5rem;
  border-bottom: 1px solid var(--color-line2);
  cursor: pointer;
}

.word-text {
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: var(--color-link);
}

.small-text {
  font-weight: lighter;
  color: var(--color-text2);
  font-size: 0.8rem;
}

.center-text {
  text-align: center;
}
</style>
