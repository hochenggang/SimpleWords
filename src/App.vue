<script setup lang="ts">


import { ref, onMounted, watch, Transition } from "vue";

import Selecter from './components/Selecter.vue'
import Loading from './components/Loading.vue'
import WordsList from './components/WordsList.vue'
import WordDetail from './components/WordDetail.vue'

import { getWordCollectionNames, getWordCollection } from './query';
import { buildWordListContent } from './wordTool';
import { getDate, REQUESTING_COUNT, wordCollectionName, wordCollectionNames, wordCollectionContent, wordListLimit, wordListContent, currentWordDetail, wordListId } from './shared';

// .then((res) => res.json())
// .then((json) => {})
// .catch((err) => console.log('error:',err))
// .finally(() => REQUESTING_COUNT.value -= 1)

const initWordListContent = () => {
  if (localStorage.getItem('wordListId') == wordListId.value) {
    console.log('initWordListContent by cache.');
    wordListContent.value = JSON.parse(localStorage.getItem('wordListContent') as string);
  } else {
    console.log('initWordListContent by rebuild.');
    buildWordListContent(wordListLimit.value);
  }
}

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
  // update word listNames
  getWordCollectionNames()
    .then((res) => res.json())
    .then((json) => {
      wordCollectionNames.value = json;
      console.log('ok -> load word list names.')
      // init word collection name
      if (!wordCollectionName.value) {
        wordCollectionName.value = wordCollectionNames.value[0][0];
        console.log('ok -> init word list name.')
      } else {
        initWordCollectionContent();
      }
    })
    .catch((err) => console.log('error:', err))
    .finally(() => REQUESTING_COUNT.value -= 1)

  // check date diff, reset todayFinishedNum
  if (localStorage.getItem('date') != getDate()) {
    console.log('reset todayFinishedNum.');
    localStorage.setItem('todayFinishedNum', '0');
  }

  // update date
  localStorage.setItem('date', getDate());
})



// rebuild word list content when word collection content changed
watch([wordCollectionName, wordListLimit], () => {
  console.log('watch: wordCollectionName.')
  localStorage.setItem('wordCollectionName', wordCollectionName.value);
  localStorage.setItem('wordListLimit', String(wordListLimit.value));
  initWordCollectionContent();
})

</script>

<template>
  <div class="main">
    <Loading :count="REQUESTING_COUNT" :after="300" />
    <Selecter />
    <WordsList />
    <Transition >
      <WordDetail v-if="currentWordDetail" />
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
