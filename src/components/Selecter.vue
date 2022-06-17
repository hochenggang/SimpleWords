<template>

  <Transition name="slide-fade">

    <div class="bar top-bar shadow" v-if="!selecterVisible">
      <div class="buttons">
        <p class="note-text">{{ dailyWordsNumExist }} Today</p>
        <div class="button header-icon" @click="selecterVisible = !selecterVisible">
          <IconSetting />
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="slide-fade">
    <div class="bar top-bar shadow" v-if="selecterVisible">
      <div class="buttons">
        <p class="note-text">设置</p>
        <div class="button  header-icon" @click="selecterVisible = !selecterVisible">
          <IconClose />
        </div>
      </div>
      <div class="buttons">
        <p class="note-text">设定单词集</p>
        <select class="book-name-selecter link-text" v-model="currentWordCollectionName">
          <option class="link-text" v-for="name in currentWordCollectionNameList" :key="name" :value="name">{{
              name.split(".")[0]
          }}</option>
        </select>
      </div>
      <div class="buttons">
        <p class="note-text">设定记忆量</p>
        <select class="book-name-selecter link-text" v-model="dailyWordsNum">
          <option class="link-text" v-for="num in [10, 20, 30, 50, 100]" :key="num" :value="num">每天 {{ num }} 个</option>
        </select>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, watch, watchEffect } from "vue";
import { parseJson, getFile } from "../request";
import IconSetting from './icons/IconSetting.vue'
import IconClose from './icons/close.vue'

// tell father component the current book name
const emit = defineEmits<{
  (e: 'setWordCollectionName', name: string): void,
  (e: 'setDailyWordsNum', num: number): void,

}>()

const props = defineProps<{
  dailyWordsNumExist: number
}>()

const selecterVisible = ref(false);
const dailyWordsNum = ref(0);
const currentWordCollectionName = ref("");
const currentWordCollectionNameList = ref<string[]>([]);

const setCurrentWordCollectionNameList = (data: string[]) => {
  currentWordCollectionNameList.value = data;
  localStorage.setItem('currentWordCollectionNameList', JSON.stringify(data));
  if (!currentWordCollectionName.value) {
    currentWordCollectionName.value = currentWordCollectionNameList.value[currentWordCollectionNameList.value.length - 1];
    localStorage.setItem('currentWordCollectionName', currentWordCollectionName.value)
  }
};


watch(currentWordCollectionName, () => {
  // if currentWordCollectionName changed, save it
  if (currentWordCollectionName.value) {
    console.log("Selecter -> watchEffect -> save WordCollectionName", currentWordCollectionName.value)
    localStorage.setItem('currentWordCollectionName', currentWordCollectionName.value);
    emit('setWordCollectionName', currentWordCollectionName.value);
  }
})

watch(dailyWordsNum, () => {
  // if dailyWordsNum changed, save it
  if (dailyWordsNum.value) {
    console.log("Selecter -> watchEffect -> save dailyWordsNum", dailyWordsNum.value)
    localStorage.setItem('dailyWordsNum', String(dailyWordsNum.value));
    emit('setDailyWordsNum', dailyWordsNum.value)
  }
})


onBeforeMount(() => {
  // check localhistory to load currentWordCollectionName if it exists.
  if (localStorage.getItem('currentWordCollectionName')) {
    currentWordCollectionName.value = localStorage.getItem('currentWordCollectionName') as string;
    console.log("Selecter -> onBeforeMount -> load currentWordCollectionName", currentWordCollectionName.value)
  }

  // check localhistory to load currentWordCollection if it exists.
  if (localStorage.getItem('currentWordCollection')) {
    setCurrentWordCollectionNameList(JSON.parse(localStorage.getItem('currentWordCollection')!));
    console.log("Selecter -> onBeforeMount -> load currentWordCollection", dailyWordsNum.value)
  }

  // check localhistory to load dailyWordsNum if it exists.
  if (localStorage.getItem('dailyWordsNum')) {
    dailyWordsNum.value = Number(localStorage.getItem('dailyWordsNum'));
    console.log("Selecter -> onBeforeMount -> load dailyWordsNum", dailyWordsNum.value);
  } else {
    dailyWordsNum.value = 20;
  }

  getFile('collection/names.json', parseJson, setCurrentWordCollectionNameList)



})
</script>

<style scoped>
.book-name-selecter {
  display: flex;
  flex-grow: 1;
  padding: 1rem 1rem;
}

.header-icon {
  padding-right: 0;
  padding-left: 0;
}
</style>
