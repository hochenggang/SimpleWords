<template>
  <div>
    <div v-if="currentWordDetail" v-on:click="currentWordDetail = null" class="fixed-full "
      style="background-color: var(--color-bg);z-index: 4;"></div>
    <div class="bar top-bar shadow" style="z-index: 5;">
      <div :key="currentWord" class="detail" v-if="currentWordDetail">
        <div class="auto-warp">
          <span class="detail-h1 space ">{{ currentWord }}</span>
          <span>
            <span class="detail-h4 space">{{ '⭐️'.repeat(Number(currentWordDetail?.collins_star)) }}</span>
            <span class="detail-h4" v-if="currentWordDetail?.frequency_rank">{{ currentWordDetail?.frequency_rank
            }}/{{
              Math.round(currentWordDetail!.frequency_count /
              10000)
              }}w</span>
          </span>
        </div>
        <div>
          <span class="detail-h4 detail-voice space"
            @click="playAudio(getWordVoiceLink(currentWordDetail!.ph_am_mp3))">美/{{
            currentWordDetail?.ph_am
            }}/</span>
          <span class="detail-h4 detail-voice" @click="playAudio(getWordVoiceLink(currentWordDetail!.ph_en_mp3))">英/{{
          currentWordDetail?.ph_en
          }}/</span>
        </div>
        <div :class="detailVisible ? '' : 'blur'" @click="detailVisible = true">
          <div class="detail-h2">
            <p v-for="p in currentWordDetail?.parts">{{ p.part }} {{ p.means.join('、') }}</p>
          </div>
          <div class="detail-sentences" v-for="c in currentWordDetail?.collins">
            <!-- <p class="detail-h3">{{ c.posp }}</p> -->
            <p class="detail-h3">{{ c.def }}</p>
            <p class="detail-h3">{{ c.tran }}</p>
            <div class="detail-sentences" v-for="e in c.example">
              <p class="detail-h4 detail-voice" @click="playAudio(getSentenceVoiceLink(e.tts_mp3))"
                v-html="getMarkedSentence(e.ex)"></p>
              <p class="detail-h5">{{ e.tran }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bar bottom-bar shadow" style="z-index: 6;" v-if="currentWordDetail">
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
  currentWordDetail,

} from '../shared';

const detailVisible = ref(false);


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

  const temp = JSON.parse(localStorage.getItem('learningHistory')!) || {};
  temp[word] = count;
  localStorage.setItem('learningHistory', JSON.stringify(temp));
  delete wordListContent.value[word];
  localStorage.setItem('wordListContent', JSON.stringify(wordListContent.value));

}

const addHistory = (word: string, count: number) => {
  let baseCount = 0;
  const temp = JSON.parse(localStorage.getItem('learningHistory')!) || {};
  if (temp.hasOwnProperty(word)) {
    baseCount = temp[word];
  }
  setHistory(word, baseCount + count);
  todayFinishedNum.value += 1;
}

const markWord = (action: string) => {
  console.log("WordDetail -> markWord ->", currentWord.value, action)
  switch (action) {
    case 'know':
      // if mark to know, set count+3 
      addHistory(currentWord.value, 5)
      break;
    case 'maybeKnow':
      // if mark to maybeKnow, set count+3
      addHistory(currentWord.value, 1)
      break;
    case 'unknow':
      // if mark to unknow, set 0
      setHistory(currentWord.value, 0)
      break;
    default:
      break;
  }


  // auto play action
  if (localStorage.getItem('autoLoadNextWord') == 'on') {
    if (wordListContent.value) {
      const words = Object.keys(wordListContent.value);
      const nextIndex = Math.round(Math.random() * (words.length - 1));
      console.log('markWord -> autoNext -> ', words[nextIndex]);

      if (words[nextIndex]) {
        currentWord.value = words[nextIndex];
      } else {
        currentWordDetail.value = null;
      }
    }
  } else {
    // close detail
    currentWordDetail.value = null;
  }


}


const getMarkedSentence = (text: string) => {
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

watch(todayFinishedNum, () => {
  localStorage.setItem('todayFinishedNum', String(todayFinishedNum.value));
})

onMounted(() => {

  // do auto play onmount
  if (autoPlayStatus.value == 'on') {
    console.log(currentWordDetail)
    if (autoPlayType.value == 'am') {
      playAudio(getWordVoiceLink(currentWordDetail.value!.ph_am_mp3))
    } else {
      playAudio(getWordVoiceLink(currentWordDetail.value!.ph_en_mp3))
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
