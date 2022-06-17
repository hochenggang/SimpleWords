<script setup lang="ts">


import { ref, onBeforeMount, watch, Transition } from "vue";

import Selecter from './components/Selecter.vue'
import Loading from './components/Loading.vue'
import WordsList from './components/WordsList.vue'
import WordDetail from './components/WordDetail.vue'

import { REQUESTING_COUNT } from './shared';


const currentWordCollectionName = ref("");
const setWordCollectionName = (name: string) => {
  currentWordCollectionName.value = name;
  console.log("App -> setWordCollectionName -> ", currentWordCollectionName.value)
}

const dailyWordsNum = ref(0);
const setDailyWordsNum = (num: number) => {
  dailyWordsNum.value = num;
  console.log("App -> setDailyWordsNum -> ", dailyWordsNum.value)
}

const callWordListAction = ref('')
const callWordList = (action: string) => {
  console.log("App -> callWordList -> ", action)
  callWordListAction.value = action
}

const currentWordName = ref('')
const setCurrentWordName = (name: string) => {
  currentWordName.value = name
}

const dailyWordsNumExist = ref(0)
const setDailyWordsNumExist = (num: number) => {
  dailyWordsNumExist.value = num
}

</script>

<template>
  <div class="main">
    <Loading :count="REQUESTING_COUNT" :after="300" />
    <Selecter :daily-words-num-exist="dailyWordsNumExist" @set-word-collection-name="setWordCollectionName"
      @set-daily-words-num="setDailyWordsNum" />
    <WordsList v-if="currentWordCollectionName" @set-daily-words-num-exist="setDailyWordsNumExist"
      :call-word-list-action="callWordListAction" :daily-words-num="dailyWordsNum"
      :word-collection-name="currentWordCollectionName" @set-current-word-name="setCurrentWordName" />
    <WordDetail :key="currentWordName" v-if="currentWordName" @call-word-list="callWordList"
      @set-current-word-name="setCurrentWordName" :word-name="currentWordName" :book-name="currentWordCollectionName" />
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
  transition: opacity 0.1s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.5s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
