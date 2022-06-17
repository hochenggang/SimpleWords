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


const dailyWordsNum = ref(0)
const wordCollectionName = ref('')
const callWordListAction = ref('')
const currentWordCollection = ref<string[]>([])
const learningHistory = ref<Record<string, number>>({})
const dailyWordCollection = ref<Record<string, number>>({})
const dailyWordCollectionKeys = computed(() => Object.keys(dailyWordCollection.value))
const dailyWordCollectionFirstLearnKeys = computed(() => Object.keys(dailyWordCollection.value).filter((w) => dailyWordCollection.value[w] > 0 ? false : true))
const learningHistoryKeys = computed(() => Object.keys(learningHistory.value))

// prevent props
watchEffect(() => {
  console.log("WordList -> props changed", props)
  if (wordCollectionName.value != props.wordCollectionName) {
    wordCollectionName.value = props.wordCollectionName
  }
  if (dailyWordsNum.value != props.dailyWordsNum) { dailyWordsNum.value = props.dailyWordsNum }
  if (callWordListAction.value != props.callWordListAction) { callWordListAction.value = props.callWordListAction }
})


const getDate = () => {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
}


const resetCache = () => {
  localStorage.removeItem('todayDate')
  localStorage.removeItem('dailyWordCollection')
}

const loadCache = () => {
  // load know words
  console.log("WordList -> loadCache.");
  // load history
  if (localStorage.getItem('learningHistory')) {
    learningHistory.value = JSON.parse(localStorage.getItem('learningHistory')!)
  } else {
    learningHistory.value = {};
    localStorage.setItem('learningHistory', JSON.stringify(learningHistory.value))
  }

  // delete learned word from word collection
  if (currentWordCollection.value) {
    let temp: string[] = []
    currentWordCollection.value.forEach((word) => {
      if (!learningHistoryKeys.value.includes(word)) {
        temp.push(word)
      }
    })
    currentWordCollection.value = temp
  }

  // load today words
  const todayDate = getDate();
  if (localStorage.getItem('todayDate') != todayDate) {
    prepareTodayWords()
    localStorage.setItem('todayDate', todayDate)
    localStorage.setItem('dailyWordCollection', JSON.stringify(dailyWordCollection.value))
  } else {
    dailyWordCollection.value = JSON.parse(localStorage.getItem('dailyWordCollection')!)
  }

  const learnedCount = props.dailyWordsNum - dailyWordCollectionFirstLearnKeys.value.length
  emit('setDailyWordsNumExist', learnedCount <= 0 ? 0 : learnedCount)


}


const prepareTodayWords = () => {
  console.log("WordList -> prepareTodayWords");

  if (currentWordCollection.value) {
    const todayDate = getDate();
    dailyWordCollection.value = {}
    if (localStorage.getItem('todayDate') != todayDate) {
      console.log("WordList -> It is a new beginning.", todayDate);
      // push new word
      let indexEnd = 0
      if (currentWordCollection.value.length >= props.dailyWordsNum) {
        indexEnd = props.dailyWordsNum
      } else {
        indexEnd = currentWordCollection.value.length - 1
      }
      currentWordCollection.value?.slice(0, indexEnd).forEach((word) => {
        dailyWordCollection.value[word] = 0
      })
      // push old word
      Object.keys(learningHistory.value).forEach((word) => {
        // if remember time less than 3 , push to review
        if (learningHistory.value[word] < 3) {
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


const setCurrentWordCollection = (data: string[]) => {
  currentWordCollection.value = data;
  localStorage.setItem(wordCollectionName.value, JSON.stringify(data));
  if (localStorage.getItem('reset') == '1') {
    resetCache()
    loadCache()
    localStorage.removeItem('reset')
  }
  if (localStorage.getItem('reload') == '1') {
    loadCache()
    localStorage.removeItem('reload')
  }
};


const getWordCollection = () => {
  console.log("WordList -> getWordCollection", wordCollectionName.value)
  if (wordCollectionName) {
    if (localStorage.getItem(wordCollectionName.value)) {
      setCurrentWordCollection(JSON.parse(localStorage.getItem(wordCollectionName.value)!))
    } else {
      if (!localStorage.getItem(wordCollectionName.value)) {
        getFile('collection/' + wordCollectionName.value, parseJson, setCurrentWordCollection)
      }
    }
  }
}

watch(wordCollectionName, () => {
  console.log("WordList -> watch -> wordCollectionName", wordCollectionName.value)
  if (wordCollectionName.value) {
    getWordCollection()
  }
})


watch(callWordListAction, () => {
  console.log("WordList -> watchEffect -> callWordListAction", callWordListAction.value)

  if (callWordListAction.value.includes('loadCache')) {
    loadCache()
  }
  if (callWordListAction.value.includes('resetCache')) {
    resetCache()
    loadCache()
  }
})




watchEffect(() => {
  // if dailyWordsNum changed, save it
  const beforeArgs = localStorage.getItem('beforeArgs')
  const currentArgs = dailyWordsNum.value + wordCollectionName.value
  // only flush data after first loaded
  if (localStorage.getItem('todayDate')) {
    if (dailyWordsNum.value && wordCollectionName.value && currentArgs != beforeArgs) {
      localStorage.setItem('beforeArgs', currentArgs)
      console.log("WordList -> watchEffect -> resetCache")
      localStorage.setItem('reset', '1')
      getWordCollection()
    }
  }
})


onBeforeMount(() => {
  console.log("WordList -> onBeforeMount");
  localStorage.setItem('reload', '1')
  getWordCollection()
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
