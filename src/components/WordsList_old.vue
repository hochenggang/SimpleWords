<template>
  <ul v-if="dailyWordCollection" class="word-list">
    <li class="word-item" @click="emit('setCurrentWordName', word)" v-for="word in dailyWordCollection" :key="word">
      <span class="word-text">{{ word }}</span>
      <IconMax />
    </li>
    <p class="fixed-full flex-center note-text" v-if="!dailyWordCollection.length">
      All done.
    </p>
  </ul>


</template>

<script setup lang="ts">
import { ref, onBeforeMount, watch, watchEffect } from "vue";
import { parseJson, getFile } from "../request";
import IconMax from './icons/arrayMax.vue'

const emit = defineEmits<{
  (e: "setCurrentWordName", name: string): void;
  (e: "setDailyWordsNumExist", num: number): void;

}>();

const props = defineProps<{
  wordCollectionName: string,
  dailyWordsNum: number,
  callWordListAction: string,
}>()

const currentWordCollection = ref<string[]>([])

const currentUnknowWordCollection = ref<string[]>([])
const currentMaybeKnowWordCollection = ref<string[]>([])
const currentKnowWordCollection = ref<string[]>([])

const dailyWordCollection = ref<string[]>([])


const wordCollectionName = ref('')
const dailyWordsNum = ref(0)
const callWordListAction = ref('')

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
  return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
}


const resetCache = () => {

  localStorage.removeItem('todayDate')
  localStorage.removeItem('dailyWordCollection')
  localStorage.removeItem('currentUnknowWordCollection')
}

const loadCache = () => {
  // load know words

  if (localStorage.getItem('currentKnowWordCollection')) {
    currentKnowWordCollection.value = JSON.parse(localStorage.getItem('currentKnowWordCollection')!)
  } else {
    currentKnowWordCollection.value = [];
    localStorage.setItem('currentKnowWordCollection', JSON.stringify(currentKnowWordCollection.value))
  }

  // load maybe unknow words
  if (localStorage.getItem('currentMaybeKnowWordCollection')) {
    currentMaybeKnowWordCollection.value = JSON.parse(localStorage.getItem('currentMaybeKnowWordCollection')!)
  } else {
    currentMaybeKnowWordCollection.value = [];
    localStorage.setItem('currentMaybeKnowWordCollection', JSON.stringify(currentMaybeKnowWordCollection.value))
  }

  // load unknow words
  if (localStorage.getItem('currentUnknowWordCollection')) {
    currentUnknowWordCollection.value = JSON.parse(localStorage.getItem('currentUnknowWordCollection')!)
  } else {
    currentUnknowWordCollection.value = []
    currentWordCollection.value.forEach((word) => {
      if (!currentKnowWordCollection.value.includes(word) && !currentMaybeKnowWordCollection.value.includes(word)) {
        currentUnknowWordCollection.value.push(word);
      }
    })
    localStorage.setItem('currentUnknowWordCollection', JSON.stringify(currentUnknowWordCollection.value))
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

  emit('setDailyWordsNumExist', props.dailyWordsNum - dailyWordCollection.value.length)


}


const prepareTodayWords = () => {
  console.log("WordList -> prepareTodayWords");

  if (currentUnknowWordCollection.value) {
    const todayDate = getDate();
    if (localStorage.getItem('todayDate') != todayDate) {
      console.log("WordList -> It is a new beginning.", todayDate);
      if (currentUnknowWordCollection.value.length >= props.dailyWordsNum) {
        dailyWordCollection.value = currentUnknowWordCollection.value?.slice(0, props.dailyWordsNum)
      } else {
        dailyWordCollection.value = currentUnknowWordCollection.value?.slice(0, currentWordCollection.value.length - 1)
      }
    } else {
      console.log("WordList -> It is a old day.", todayDate);
      dailyWordCollection.value = JSON.parse(localStorage.getItem('dailyWordCollection')!) as string[];
    }
    return dailyWordCollection.value
  } else {
    return []
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
        getFile('words_list/' + wordCollectionName.value, parseJson, setCurrentWordCollection)
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
      console.log("WordList -> watchEffect -> resetCache", beforeArgs)
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

.center-text {
  text-align: center;
}
</style>
