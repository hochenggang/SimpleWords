<template>
  <ul class="word-list">
    <!-- 点击单词的时候，会把这个单词赋值到 currentWord 并加载单词的详情显示 -->
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

// 根据配置项，显示今日词集
// 并提供详情支持

import { computed, watch } from 'vue';
import { wordListContent, wordListLimit, currentWord, REQUESTING_COUNT, wordDetail, wordQueryHistory } from '../shared';
import { getWord } from '../query';

const wordListContentKeys = computed(() => Object.keys(wordListContent.value));

// 请求单词详情
const doGetWordDetail = (wordName: string) => {
  // remove before detail
  wordDetail.value = null;
  getWord(wordName)
    .then((res) => res.json())
    .then((json) => {
      wordDetail.value = json;
      console.log('doGetWordDetail success -> ', wordName, wordDetail.value);
    })
    .catch((err) => {
      // 遇到错误时，直接在今日计划内移除
      console.log('error:', err);
      wordDetail.value = null;
      delete wordListContent.value[wordName];
      // 继续加载查询过的单词
      if (wordQueryHistory.value.length > 0) {
        wordQueryHistory.value.pop();
      }
    })
    .finally(() => REQUESTING_COUNT.value -= 1)
}


const setWord = (wordName: string) => {
  wordQueryHistory.value.push(wordName);
}

// 响应 wordQueryHistory
watch(wordQueryHistory, () => {
  console.log(wordQueryHistory.value,currentWord.value)
  if (currentWord.value) {
    doGetWordDetail(currentWord.value);
  } else {
    wordDetail.value = null;
  }
}, { deep: true })

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
