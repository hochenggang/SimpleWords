<template>
  <Transition name="slide-fade">
    <div v-if="settingVisible" class="fixed-full " style="background-color: var(--color-bg);z-index: 2;"></div>
  </Transition>
  <Transition name="slide-fade">
    <div class="bar top-bar shadow" v-if="!settingVisible">
      <div class="buttons">
        <p class="setting-text">{{ todayFinishedNum }} Today</p>
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
          <p class="setting-text">{{ briefInfo }}</p>

          <div class="setting-input" @click="settingVisible = !settingVisible">
            <IconBack />
          </div>
        </div>
        <div class="setting-item">
          <p class="setting-text">设定单词集</p>
          <select class="setting-input" v-model="wordCollectionName">
            <option class="setting-text link-color" v-for="name in wordCollectionNames" :key="name" :value="name[0]">
              {{ name[0].split(".")[0] }} | {{ name[1] }} 词</option>
          </select>
        </div>
        <div class="setting-item">
          <p class="setting-text">设定记忆量</p>
          <select class="setting-input" v-model="wordListLimit">
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
          <p class="setting-text">Ver.20221012</p>

        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

// 与 APP 组件密切配合
// 承载配置项

import { ref, onBeforeMount, watch, watchEffect } from "vue";
import {
  getDate,
  REQUESTING_COUNT,
  wordListLimit,
  wordCollectionName,
  wordCollectionNames,
  wordCollectionContent,
  wordListContent,
  todayFinishedNum,
  autoPlayStatus,
  autoPlayType,
  autoLoadNextWord,

} from '../shared';

import IconSetting from './icons/IconSetting.vue'
import IconBack from './icons/back.vue'
import { computed } from "@vue/reactivity";

const settingVisible = ref(false);



// 提供配置重置功能
const cleanCacheConfirm = () => {
  const r = confirm('历史记录会被清除\n设置记录将会被重置\n确定要继续吗？')
  if (r) {
    localStorage.clear()
    location.reload()
  }
}

// 提供词集摘要
const briefInfo = computed(() => {
  let count = 0;
  const learningHistory = JSON.parse(localStorage.getItem('learningHistory')!) as {} || {};
  const wordCollection = JSON.parse(localStorage.getItem(wordCollectionName.value)!) as [] || [];
  wordCollection.forEach((word) => {
    if (learningHistory.hasOwnProperty(word)) {
      count += 1;
    }
  })
  let percent = count / wordCollection.length;
  if ((percent < 0.01) && (percent > 0)) percent = 0.01;
  if (!percent) percent = 0;
  return wordCollectionName.value.split('.json')[0] + ' | ' + percent.toFixed(2) + '%';
})

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
