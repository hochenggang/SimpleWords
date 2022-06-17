<template>
  <Transition name="slide-fade">
    <div v-if="settingVisible" class="fixed-full " style="background-color: var(--color-bg);z-index: 2;"></div>
  </Transition>
  <Transition name="slide-fade">

    <div class="bar top-bar shadow" v-if="!settingVisible">
      <div class="buttons">
        <p class="note-text">{{ dailyWordsNumExist }} Today</p>
        <div class="button header-icon" @click="settingVisible = !settingVisible">
          <IconSetting />
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="slide-fade">
    <div class="bar top-bar shadow" v-if="settingVisible">
      <div class="buttons">
        <p class="note-text button">设置</p>
        <div class="button header-icon" @click="settingVisible = !settingVisible">
          <IconClose />
        </div>
      </div>
      <div class="buttons">
        <p class="note-text button">设定单词集</p>
        <select class="book-name-selecter link-text" v-model="wordCollectionName">
          <option class="link-text" v-for="name in wordCollectionNameList" :key="name" :value="name">{{
              name.split(".")[0]
          }}</option>
        </select>
      </div>
      <div class="buttons">
        <p class="note-text button">设定记忆量</p>
        <select class="book-name-selecter link-text" v-model="dailyWordsNum">
          <option class="link-text" v-for="num in [10, 20, 30, 50, 100]" :key="num" :value="num">每天 {{ num }} 个</option>
        </select>
      </div>
      <div class="buttons">
        <p class="note-text button">自动播放开关</p>
        <select class="book-name-selecter link-text" v-model="autoPlayStatus">
          <option class="link-text" v-for="status in ['off', 'on']" :key="status" :value="status">{{ status == 'on' ?
              '开'
              : '关'
          }}
          </option>
        </select>
      </div>
      <div class="buttons" v-if="autoPlayStatus == 'on'">
        <p class="note-text button">自动播放类型</p>
        <select class="book-name-selecter link-text" v-model="autoPlayType">
          <option class="link-text" v-for="status in ['am', 'en']" :key="status" :value="status">{{ status == 'am' ?
              '美标' :
              '英标'
          }}
          </option>
        </select>
      </div>
      <div class="buttons">
        <p class="note-text button">连续加载单词</p>
        <select class="book-name-selecter link-text" v-model="autoLoadNextWord">
          <option class="link-text" v-for="status in ['off', 'on']" :key="status" :value="status">{{ status == 'on' ?
              '开'
              : '关'
          }}
          </option>
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

const settingVisible = ref(false);

const loadDailyWordsNum = () => localStorage.getItem('dailyWordsNum') ? Number(localStorage.getItem('dailyWordsNum')!) : 20
const dailyWordsNum = ref(loadDailyWordsNum());

const wordCollectionName = ref(localStorage.getItem('wordCollectionName') || '');

const loadWordCollectionNameList = () => localStorage.getItem('wordCollectionNameList') ? JSON.parse(localStorage.getItem('WordCollectionNameList')!) : []
const wordCollectionNameList = ref<string[]>(loadWordCollectionNameList());

const autoPlayStatus = ref(localStorage.getItem('autoPlayStatus') || 'off');
const autoPlayType = ref(localStorage.getItem('autoPlayType') || 'am');
const autoLoadNextWord = ref(localStorage.getItem('autoLoadNextWord') || 'off');


watchEffect(() => {
  console.log('Selecter -> watchEffect -> save normal config.')
  localStorage.setItem('autoPlayStatus', autoPlayStatus.value)
  localStorage.setItem('autoPlayType', autoPlayType.value)
  localStorage.setItem('autoLoadNextWord', autoLoadNextWord.value)
})


const setWordCollectionNameList = (data: string[]) => {
  wordCollectionNameList.value = data;
  localStorage.setItem('wordCollectionNameList', JSON.stringify(data));
  if (!wordCollectionName.value) {
    wordCollectionName.value = wordCollectionNameList.value[wordCollectionNameList.value.length - 1];
    localStorage.setItem('wordCollectionName', wordCollectionName.value)
  }
  emit('setWordCollectionName', wordCollectionName.value);
  emit('setDailyWordsNum', dailyWordsNum.value)
};


watch(wordCollectionName, () => {
  console.log("Selecter -> watchEffect -> save WordCollectionName", wordCollectionName.value)
  localStorage.setItem('wordCollectionName', wordCollectionName.value);
  emit('setWordCollectionName', wordCollectionName.value);
})

watch(dailyWordsNum, () => {
  console.log("Selecter -> watchEffect -> save dailyWordsNum", dailyWordsNum.value)
  localStorage.setItem('dailyWordsNum', String(dailyWordsNum.value));
  emit('setDailyWordsNum', dailyWordsNum.value)
})


onBeforeMount(() => {
  getFile('collection/names.json', parseJson, setWordCollectionNameList)
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
