<script setup lang="ts">
// 今日词集属于某个单词集，某个单词集来自全部词集
// 当 APP 被加载时，需要准备好所有可以选的单词集，然后根据当前的单词集名称，准备好今日需要完成的单词
// 与配置组件密切配合，当词集名称或者今日记忆量发生变化时，更新今日单词

import { ref, onMounted, watch, Transition } from "vue";

import SelecterEl from './components/Selecter.vue'
import LoadingEl from './components/Loading.vue'
import WordsListEl from './components/WordsList.vue'
import WordDetailEl from './components/WordDetail.vue'

import { getWordCollectionNames, getWordCollection } from './query';
import { buildWordListContent } from './wordTool';
import { getDate, REQUESTING_COUNT, wordCollectionName, wordCollectionNames, wordCollectionContent, wordListLimit, wordListContent, wordDetail, wordListId, todayFinishedNum } from './shared';

// 准备今日词集
const initWordListContent = () => {
  if (localStorage.getItem('wordListId') == wordListId.value) {
    console.log('initWordListContent by cache.');
    wordListContent.value = JSON.parse(localStorage.getItem('wordListContent') as string);
  } else {
    console.log('initWordListContent by rebuild.');
    buildWordListContent(wordListLimit.value);
  }
}

// 准备某个单词集
const initWordCollectionContent = () => {
  if (localStorage.getItem(wordCollectionName.value)) {
    console.log('initWordCollectionContent by cache.')
    wordCollectionContent.value = JSON.parse(localStorage.getItem(wordCollectionName.value) as string);
    initWordListContent();
  } else {
    console.log('initWordCollectionContent by remote.')
    getWordCollection(wordCollectionName.value)
      .then((res) => res.json())
      .then((json) => {
        wordCollectionContent.value = Array.from(new Set(json));
        localStorage.setItem(wordCollectionName.value, JSON.stringify(wordCollectionContent.value));
        initWordListContent()
      })
      .catch((err) => console.log('error:', err))
      .finally(() => REQUESTING_COUNT.value -= 1)
  }
}

onMounted(() => {
  // 准备词集列表
  getWordCollectionNames()
    .then((res) => res.json())
    .then((json) => {
      wordCollectionNames.value = json;
      console.log('wordCollectionNames load successfully.')
      // 选定词集名称
      if (!wordCollectionName.value) {
        wordCollectionName.value = wordCollectionNames.value[0][0];
        console.log('wordCollectionName auto selected.')
      } else {
        initWordCollectionContent();
      }
    })
    .catch((err) => console.log('error:', err))
    .finally(() => REQUESTING_COUNT.value -= 1)

  // 如果日期变化，重置学习进度
  if (localStorage.getItem('date') != getDate()) {
    console.log('reset todayFinishedNum.');
    localStorage.setItem('todayFinishedNum', '0');
    todayFinishedNum.value = 0;
  }

  // 更新日期缓存
  localStorage.setItem('date', getDate());
})



// rebuild word list content when word collection content changed
watch([wordCollectionName, wordListLimit], () => {
  console.log('APP -> initWordCollectionContent');
  initWordCollectionContent();
})

</script>

<template>
  <div class="main">
    <LoadingEl :count="REQUESTING_COUNT" :after="300" />
    <SelecterEl />
    <WordsListEl />
    <Transition >
      <WordDetailEl v-if="wordDetail" />
    </Transition>
  </div>
</template>

<style>
.main {
  padding: 1rem;
}

.bar {
  position: fixed;
  left: 0;
  width: calc(100% - 2rem);
  margin: 1rem;
  background-color: transparent;
  z-index: 3;
}

.top-bar {
  top: 0;

}

.bottom-bar {
  bottom: 0;
}

.shadow {
  box-shadow: 0 2px 10px #0000001a;
}


.icon {
  width: 1.15rem;
  height: 1.15rem;
  stroke: var(--color-link);
}

.buttons {
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 1rem;
  opacity: .95;
}

.button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--color-link);
  background-color: transparent;
  cursor: pointer;
}

.false-button {
  font-size: 1rem;
  padding: .5rem .75rem;
  color: var(--color-link);
  background-color: transparent
}


.note-text {
  font-size: 0.9rem;
  font-weight: lighter;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  color: var(--color-text2);
}


.link-text {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  font-size: 0.9rem;
  color: var(--color-link);
}

.fixed-full {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  flex-direction: column;
}


.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>
