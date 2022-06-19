<template>
  <ul v-if="dailyWordCollectionKeys" class="word-list">
    <li class="word-item" @click="emit('setCurrentWordName', k)" v-for=" k in dailyWordCollectionKeys" :key="k">
      <span class="word-text">{{ k }}</span>
      <span class="circle-text">{{ dailyWordCollection[k] > 0 ? '复' : '新' }}</span>
    </li>
    <p class="fixed-full flex-center note-text" v-if="!dailyWordCollectionKeys.length">
      All done.
    </p>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref, onBeforeMount, watch, watchEffect } from "vue";
import { parseJson, getFile } from "../request";

const emit = defineEmits<{
  (e: "setCurrentWordName", name: string): void;
  (e: "setDailyWordsNumExist", num: number): void;

}>();

const props = defineProps<{
  wordCollectionName: string,
  dailyWordsNum: number,
  callWordListAction: string,
}>()


const loadWordCollection = () => localStorage.getItem(props.wordCollectionName) ? JSON.parse(localStorage.getItem(props.wordCollectionName)!) : []
const wordCollection = ref<string[]>(loadWordCollection())

const loadLearningHistory = () => localStorage.getItem('learningHistory') ? JSON.parse(localStorage.getItem('learningHistory')!) : {}
const learningHistory = ref<Record<string, number>>(loadLearningHistory())

const loadDailyWordCollection = () => localStorage.getItem('dailyWordCollection') ? JSON.parse(localStorage.getItem('dailyWordCollection')!) : {}
const dailyWordCollection = ref<Record<string, number>>(loadDailyWordCollection())

const dailyWordCollectionKeys = computed(() => Object.keys(dailyWordCollection.value))
const dailyWordCollectionFirstLearnKeys = computed(() => Object.keys(dailyWordCollection.value).filter((w) => dailyWordCollection.value[w] > 0 ? false : true))
const learningHistoryKeys = computed(() => Object.keys(learningHistory.value))


const getDate = () => {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
}

const sendLearnedCount = () => {
  const learnedCount = props.dailyWordsNum - dailyWordCollectionFirstLearnKeys.value.length
  emit('setDailyWordsNumExist', learnedCount <= 0 ? 0 : learnedCount)
}



const prepareTodayWords = () => {
  console.log("WordList -> prepareTodayWords");
  if (wordCollection.value) {
    const todayDate = getDate();
    dailyWordCollection.value = {}
    if (localStorage.getItem('todayDate') != todayDate) {
      console.log("WordList -> It is a new beginning.", todayDate);
      // push new word
      let indexEnd = 0
      if (wordCollection.value.length >= props.dailyWordsNum) {
        indexEnd = props.dailyWordsNum
      } else {
        indexEnd = wordCollection.value.length - 1
      }
      wordCollection.value?.slice(0, indexEnd).forEach((word) => {
        dailyWordCollection.value[word] = 0
      })
      // push old word
      Object.keys(learningHistory.value).forEach((word) => {
        // if remember time less than 10 , push to review
        if (learningHistory.value[word] < 10) {
          dailyWordCollection.value[word] = learningHistory.value[word]
        }
      })
    } else {
      console.log("WordList -> It is a old day.", todayDate);
      dailyWordCollection.value = JSON.parse(localStorage.getItem('dailyWordCollection')!);
    }
  } else {
    dailyWordCollection.value = {}
  }
}


const loadCache = () => {

  if (wordCollection.value && wordCollection.value.length > 0) {
    console.log("WordList -> loadCache.")

    // load wordCollection
    let temp: string[] = []
    wordCollection.value.forEach((word) => {
      // delete learned word from word collection
      if (!learningHistoryKeys.value.includes(word)) {
        temp.push(word)
      }
    })
    wordCollection.value = temp

    // load learningHistory
    if (!localStorage.getItem('learningHistory')) {
      localStorage.setItem('learningHistory', JSON.stringify(learningHistory.value))
    } else {
      learningHistory.value = JSON.parse(localStorage.getItem('learningHistory')!)
    }

    // only wordCollection exists, it is with mean to prepareTodayWords
    const todayDate = getDate();
    if (localStorage.getItem('todayDate') != todayDate) {
      prepareTodayWords()
      localStorage.setItem('todayDate', todayDate)
      localStorage.setItem('dailyWordCollection', JSON.stringify(dailyWordCollection.value))
    } else {
      dailyWordCollection.value = JSON.parse(localStorage.getItem('dailyWordCollection')!)
    }


  } else {
    getWordCollection()
  }

}


const rebuildCache = () => {
  console.log("WordList -> rebuildCache.")
  localStorage.removeItem('todayDate')
  localStorage.removeItem('dailyWordCollection')
  dailyWordCollection.value = {}
  loadCache()
  sendLearnedCount()

}


const setWordCollection = (data: string[]) => {
  wordCollection.value = data;
  localStorage.setItem(props.wordCollectionName, JSON.stringify(data));
  rebuildCache()
};


const getWordCollection = () => {
  console.log("WordList -> getWordCollection", props.wordCollectionName)
  if (localStorage.getItem(props.wordCollectionName)) {
    setWordCollection(JSON.parse(localStorage.getItem(props.wordCollectionName)!))
  } else {
    if (!localStorage.getItem(props.wordCollectionName)) {
      getFile('collection/' + props.wordCollectionName, parseJson, setWordCollection)
    }
  }
}

// here use watch insteed of watchEffect because watch not execute on component start but watchEffect do
watch(() => props.wordCollectionName, () => {
  console.log("WordList -> watch -> wordCollectionName", props.wordCollectionName)
  getWordCollection()
})


watch(() => props.dailyWordsNum, () => {
  console.log("WordList -> watchEffect -> wordCollectionName", props.dailyWordsNum)
  getWordCollection()
})


watch(() => props.callWordListAction, () => {
  console.log("WordList -> watchEffect -> callWordListAction", props.callWordListAction)
  if (props.callWordListAction.includes('reloadDailyWordCollection')) {
    // call from WordDetail to reload dailyWordCollection and send new count number to Selecter
    dailyWordCollection.value = JSON.parse(localStorage.getItem('dailyWordCollection')!)
    sendLearnedCount()
  }
})

onBeforeMount(() => {
  console.log("WordList -> onBeforeMount");
  // if can not get todayDate, it is the first load
  if (localStorage.getItem('todayDate')) {
    loadCache()
    sendLearnedCount()
  } else {
    rebuildCache()
  }
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

.circle-text {
  font-weight: lighter;
  color: var(--color-link);
  font-size: 0.8rem;
}

.center-text {
  text-align: center;
}
</style>
