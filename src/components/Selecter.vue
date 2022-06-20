<template>
  <Transition name="slide-fade">
    <div v-if="settingVisible" class="fixed-full " style="background-color: var(--color-bg);z-index: 2;"></div>
  </Transition>
  <Transition name="slide-fade">
    <div class="bar top-bar shadow" v-if="!settingVisible">
      <div class="buttons">
        <p class="setting-text">{{ dailyWordsNumExist }} Today</p>
        <div class="setting-input" @click="settingVisible = !settingVisible">
          <IconSetting />
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="slide-fade">
    <div class="bar top-bar shadow" v-if="settingVisible">
      <div class="setting-items">
        <div class="setting-item">
          <p class="setting-text">{{ getBriefInfo() }}</p>

          <div class="setting-input" @click="settingVisible = !settingVisible">
            <IconBack />
          </div>
        </div>
        <div class="setting-item">
          <p class="setting-text">设定单词集</p>
          <select class="setting-input" v-model="wordCollectionName">
            <option class="setting-text link-color" v-for="name in wordCollectionNameList" :key="name" :value="name[0]">
              {{ name[0].split(".")[0] }} | {{ name[1] }} 词</option>
          </select>
        </div>
        <div class="setting-item">
          <p class="setting-text">设定记忆量</p>
          <select class="setting-input" v-model="dailyWordsNum">
            <option class="setting-text link-color" v-for="num in [10, 20, 30, 50, 100]" :key="num" :value="num">每天 {{
                num
            }} 个
            </option>
          </select>
        </div>
        <div class="setting-item">
          <p class="setting-text">自动播放开关</p>
          <select class="setting-input" v-model="autoPlayStatus">
            <option class="setting-text link-color" v-for="status in ['off', 'on']" :key="status" :value="status">{{
                status
                  == 'on' ?
                  '开'
                  : '关'
            }}
            </option>
          </select>
        </div>
        <div class="setting-item" v-if="autoPlayStatus == 'on'">
          <p class="setting-text">自动播放类型</p>
          <select class="setting-input" v-model="autoPlayType">
            <option class="setting-text link-color" v-for="status in ['am', 'en']" :key="status" :value="status">{{
                status
                  == 'am' ?
                  '美标' :
                  '英标'
            }}
            </option>
          </select>
        </div>
        <div class="setting-item">
          <p class="setting-text">连续加载单词</p>
          <select class="setting-input" v-model="autoLoadNextWord">
            <option class="setting-text link-color" v-for="status in ['off', 'on']" :key="status" :value="status">{{
                status
                  == 'on' ?
                  '开'
                  : '关'
            }}
            </option>
          </select>
        </div>

        <div class="setting-item">
          <p class="setting-text">谨慎操作</p>
          <p class="setting-text danger-color" @click="cleanCacheConfirm">清除记录</p>
        </div>

        <div class="buttons">
          <p class="setting-text">Ver.20220620</p>

        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, watch, watchEffect } from "vue";
import { parseJson, getFile } from "../request";
import IconSetting from './icons/IconSetting.vue'
import IconBack from './icons/back.vue'


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

const checkCollectionNameExist = () => {
  if (!wordCollectionNameList.value.includes(wordCollectionName.value)) {
    return false
  } else {
    return true
  }
}

const setWordCollectionNameList = (data: string[]) => {
  wordCollectionNameList.value = data;
  localStorage.setItem('wordCollectionNameList', JSON.stringify(data));
  if (!checkCollectionNameExist()) {
    wordCollectionName.value = wordCollectionNameList.value[wordCollectionNameList.value.length - 1][0];
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

const cleanCacheConfirm = () => {
  const r = confirm('历史记录会被清除\n设置记录将会被重置\n确定要继续吗？')
  if (r) {
    localStorage.clear()
    location.reload()
  }
}

const getBriefInfo = () => {
  let count = 0
  const learningHistory = JSON.parse(localStorage.getItem('learningHistory')!) as {} || {}
  const wordCollection = JSON.parse(localStorage.getItem(wordCollectionName.value)!) as [] || []
  wordCollection.forEach((word) => {
    if (learningHistory.hasOwnProperty(word)) {
      count += 1
    }
  })
  let percent = count / wordCollection.length;
  if ((percent < 0.01) && (percent > 0)) percent = 0.01;
  if (!percent) percent = 0;
  return wordCollectionName.value.split('.json')[0] + ' | ' + percent.toFixed(2) + '%'
}

</script>

<style>
.setting-items {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.setting-item {
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 1rem;
  opacity: .95;
  border-bottom: 1px solid var(--color-line2);
}

.setting-input {
  display: flex;
  padding: 1rem 0;
  align-items: center;
  justify-content: right;
  text-align: right;
  color: var(--color-link);
}

.setting-text {
  font-size: 0.9rem;
  font-weight: lighter;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 1rem 0;
  color: var(--color-text2);
  cursor: pointer;
}

.danger-color {
  color: var(--color-danger);
}

.link-color {
  color: var(--color-link);
}

.overflow {
  overflow-y: scroll;
}
</style>
