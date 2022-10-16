<template>
  <div>
    <!-- 详情页的背景 -->
    <div v-if="wordDetail" class="fixed-full " style="background-color: var(--color-bg);z-index: 4;"></div>
    <!-- 详情主体 -->
    <div class="bar top-bar shadow" style="z-index: 5;">
      <div :key="currentWord" class="detail" v-if="wordDetail">
        <div class="auto-warp">
          <span class="detail-h1 space ">{{ currentWord }}</span>
          <span>
            <span class="detail-h4 space">{{ '⭐️'.repeat(Number(wordDetail?.collins_star)) }}</span>
            <span class="detail-h4" v-if="wordDetail?.frequency_rank">{{ wordDetail?.frequency_rank
            }}/{{
              Math.round(wordDetail!.frequency_count /
              10000)
              }}w</span>
          </span>
        </div>
        <!-- 单词发音 -->
        <div>
          <span class="detail-h4 detail-voice space" @click="playAudio(getWordVoiceLink(wordDetail!.ph_am_mp3))">美/{{
          wordDetail?.ph_am
          }}/</span>
          <span class="detail-h4 detail-voice" @click="playAudio(getWordVoiceLink(wordDetail!.ph_en_mp3))">英/{{
          wordDetail?.ph_en
          }}/</span>
        </div>
        <!-- 单词详情 -->
        <div>
          <div class="detail-h2">
            <p v-for="p in wordDetail?.parts">{{ p.part }} {{ p.means.join('、') }}</p>
          </div>
          <div class="detail-sentences" v-for="c in wordDetail?.collins">
            <!-- <p class="detail-h3">{{ c.posp }}</p> -->
            <!-- 英英释义 -->
            <p class="detail-h3">
              <span v-for="w in c.def.split(' ')" v-on:click="pushWord(w)">{{ w + ' ' }}</span>
            </p>
            <!-- 中文释义 -->
            <p class="detail-h3">{{ c.tran }}</p>
            <!-- 例句 -->
            <div class="detail-sentences" v-for="e in c.example">
              <p class="detail-h4 detail-voice" @click="playAudio(getSentenceVoiceLink(e.tts_mp3))"
                v-html="getMarkedSentence(e.ex)"></p>
              <p class="detail-h5">{{ e.tran }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bar bottom-bar shadow" style="z-index: 6;" v-if="wordDetail">
        <div class="buttons">
          <span class="button" style="color:var(--color-success)" @click="markWord('know')">
            已掌握
          </span>
          <span class="button" style="color:var(--color-warning)" @click="markWord('maybeKnow')">
            不确认
          </span>
          <span class="button" style="color:var(--color-danger)" @click="markWord('unkown')">
            不认识
          </span>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, onBeforeMount, watch, watchEffect, Transition, onMounted } from "vue";
import IconArrayLeft from "./icons/arrayLeft.vue";
import { Md5 } from 'ts-md5/dist/md5';
import { HOST } from '../query';

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
  currentWord,
  wordDetail,
  wordQueryHistory,

} from '../shared';

const wordDetailBlur = ref(false);

const getSentenceVoiceLink = (url: string) => HOST + '/collins/voice/sentence/' + Md5.hashStr(url) + '.mp3';
const getWordVoiceLink = (url: string) => HOST + '/collins/voice/word/' + Md5.hashStr(url) + '.mp3';

let currentAudio: HTMLAudioElement | null = null;
const playAudio = (src: string) => {
  // <audio id="myAudio" src="audiofile.mp3"></audio>
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.remove();
  }
  const a = document.createElement('audio')
  a.setAttribute('src', src)
  currentAudio = a;
  a.play()
  a.addEventListener("ended", () => {
    a.remove()
    currentAudio = null;
  });
}

const setHistory = (word: string, count: number) => {
  // 修改历史记录并回写
  const tempLearningHistory = JSON.parse(localStorage.getItem('learningHistory')!) || {};
  tempLearningHistory[word] = count;
  localStorage.setItem('learningHistory', JSON.stringify(tempLearningHistory));
  // 如果标记为已知，从今日列表删除
  if (count > 0) {
    delete wordListContent.value[word];

  }
}

const getLearningHistoryCount = (word: string) => {
  const temp = JSON.parse(localStorage.getItem('learningHistory')!) || {};
  if (temp.hasOwnProperty(word)) {
    return temp[word];
  } else {
    return 0;
  }
}

const pushWord = (word: string) => {
  word = word.replaceAll(",", '').replaceAll(".", '').replaceAll("!", '').replaceAll("?", '');
  wordQueryHistory.value.push(word);
  console.log('pushWord: ', word, wordQueryHistory.value);
}



const markWord = (action: string) => {
  console.log("WordDetailEl -> markWord ->", currentWord.value, action)
  if (!currentWord.value) {
    return
  }

  switch (action) {
    case 'know':
      // know += 5
      setHistory(currentWord.value, getLearningHistoryCount(currentWord.value) + 5);
      todayFinishedNum.value += 1;
      break;
    case 'maybeKnow':
      // maybeKnow += 3
      setHistory(currentWord.value, getLearningHistoryCount(currentWord.value) + 3);
      todayFinishedNum.value += 1;
      break;
    case 'unknow':
      // if mark to unknow, set 0
      setHistory(currentWord.value, 0)
      break;
    default:
      break;
  }


  // 只要查询列表不为空，就删掉最后一个单词
  if (wordQueryHistory.value.length > 0) {
    wordQueryHistory.value.pop();
    // 如果删除后还有单词，那么会触发加载操作
  }

  // 仅当查询列表为空时才执行连续加载检测
  if (wordQueryHistory.value.length == 0 && localStorage.getItem('autoLoadNextWord') == 'on') {
    if (wordListContent.value) {
      const words = Object.keys(wordListContent.value);
      const nextIndex = Math.round(Math.random() * (words.length - 1));
      console.log('WordDetailEl -> autoNext -> ', words[nextIndex]);
      if (words[nextIndex]) {
        wordQueryHistory.value.push(words[nextIndex]);
      } else {
        wordDetail.value = null;
      }
    }
  } else {
    // close detail
    wordDetail.value = null;
  }

}

// 获取高亮后的例句
const getMarkedSentence = (text: string) => {
  if (!currentWord.value) {
    return ''
  }
  let placeholder = currentWord.value;
  let start = text.indexOf(currentWord.value);
  if (start < 0) {
    placeholder = placeholder.replace(/^\S/, s => s.toUpperCase());
    start = text.indexOf(placeholder);
  }
  if (start < 0) {
    return text
  } else {
    return text.slice(0, start) + '<span class=detail-word-inline>' + placeholder + '</span>' + text.slice(start + currentWord.value.length, text.length)
  }
}




onMounted(() => {
  // 在加载完毕后自动播放
  if (autoPlayStatus.value == 'on') {
    if (autoPlayType.value == 'am') {
      playAudio(getWordVoiceLink(wordDetail.value!.ph_am_mp3))
    } else {
      playAudio(getWordVoiceLink(wordDetail.value!.ph_en_mp3))
    }
  }
})

</script>

<style>
.detail {
  padding: 0.75rem;
  width: 100%;
  overflow: auto;
  overflow-y: scroll;
  height: calc(100vh - 4.5rem);
}

.detail-part {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid var(--color-line);
}

.detail-sentences {
  margin: 0.25rem 0;
  padding: 0.25rem;
  border-left: 1.5px solid var(--color-line);
}

.detail-voice {
  cursor: pointer;
  color: var(--color-link);
}

.detail-h1 {
  font-size: 2rem;
  font-weight: bolder;
  line-height: 2rem;
  margin: 0.5rem 0;
}

.detail-h2 {
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.detail-h3 {
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.detail-h4 {
  font-size: 0.9rem;
}

.detail-h5 {
  font-size: 0.9rem;
  font-weight: lighter;
}

.detail-word-inline {
  font-weight: bold;
  color: var(--color-link);
}

.close {
  position: fixed;
  padding: 0.5rem;
  bottom: 2rem;
  right: 2rem;
  border: 1px solid var(--color-line);

}

hr {
  margin: 0.25rem;
  border-top: 1px solid var(--color-line);
}

.between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.space {
  margin-right: 0.5rem;

}

.auto-warp {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.blur {
  filter: blur(15px);
}
</style>
