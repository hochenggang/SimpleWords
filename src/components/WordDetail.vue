<template>
  <div>
    <Transition name="slide-fade">
      <div v-if="wordDetal" class="fixed-full " style="background-color: var(--color-bg);z-index: 4;"></div>
    </Transition>
    <div class="bar top-bar shadow" style="z-index: 5;">
      <Transition name="slide-fade">
        <div :key="props.wordName" class="detail" v-if="wordDetal">
          <div class="auto-warp">
            <span class="detail-h1 space ">{{ props.wordName }}</span>
            <span>
              <span class="detail-h4 space">{{ '⭐️'.repeat(Number(wordDetal?.collins_star)) }}</span>
              <span class="detail-h4" v-if="wordDetal?.frequency_rank">{{ wordDetal?.frequency_rank }}/{{
                  Math.round(wordDetal!.frequency_count /
                    10000)
              }}w</span>
            </span>
          </div>
          <div>
            <span class="detail-h4 detail-voice space" @click="playAudio(getWordVoiceLink(wordDetal!.ph_am_mp3))">美/{{
                wordDetal?.ph_am
            }}/</span>
            <span class="detail-h4 detail-voice" @click="playAudio(getWordVoiceLink(wordDetal!.ph_en_mp3))">英/{{
                wordDetal?.ph_en
            }}/</span>
          </div>
          <div :class="detailVisible ? '' : 'blur'" @click="detailVisible = true">
            <div class="detail-h2">
              <p v-for="p in wordDetal?.parts">{{ p.part }} {{ p.means.join('、') }}</p>
            </div>
            <div class="detail-sentences" v-for="c in wordDetal?.collins">
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
      </Transition>

      <div class="bar bottom-bar shadow" style="z-index: 6;" v-if="wordDetal">
        <div class="buttons">
          <span class="button" style="color:var(--color-danger)" @click="markWord('unkown')">
            不认识
          </span>
          <span class="button" style="color:var(--color-warning)" @click="markWord('maybeKnow')">
            不确认
          </span>
          <span class="button" style="color:var(--color-success)" @click="markWord('know')">
            已掌握
          </span>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, onBeforeMount, watch, watchEffect, Transition } from "vue";
import { parseJson, getFile, HOST } from "../request";
import IconArrayLeft from "./icons/arrayLeft.vue";
import { Md5 } from 'ts-md5/dist/md5';

const props = defineProps<{
  wordName: string,
  bookName: string,

}>()

const emit = defineEmits<{
  (e: "setCurrentWordName", name: string): void;
  (e: "callWordList", action: string): void;
}>();


const detailVisible = ref(false);

const wordDetal = ref<{
  collins: {
    def: string,
    example: {
      ex: string,
      tran: string,
      tts_mp3: string,
      tts_size: string
    }[],
    posp: string,
    tran: string
  }[],
  collins_star: string,
  frequency_count: number,
  frequency_rank: number,
  parts: { part: string, means: string[] }[],
  ph_am: string,
  ph_am_mp3: string,
  ph_en: string,
  ph_en_mp3: string
}>()


const getSentenceVoiceLink = (url: string) => HOST + '/collins/voice/sentence/' + Md5.hashStr(url) + '.mp3';
const getWordVoiceLink = (url: string) => HOST + '/collins/voice/word/' + Md5.hashStr(url) + '.mp3';

const setDetail = (data: any) => {
  console.log(data);
  wordDetal.value = data;
  const autoPlayStatus = localStorage.getItem('autoPlayStatus') || 'off';
  const autoPlayType = localStorage.getItem('autoPlayType') || 'am';
  if (autoPlayStatus == 'on') {
    switch (autoPlayType) {
      case 'am':
        playAudio(getWordVoiceLink(wordDetal.value!.ph_am_mp3))
        break;
      case 'en':
        playAudio(getWordVoiceLink(wordDetal.value!.ph_en_mp3))
        break;

      default:
        break;
    }
  }

}



const playAudio = (src: string) => {
  // <audio id="myAudio" src="audiofile.mp3"></audio>
  const a = document.createElement('audio')
  a.setAttribute('src', src)
  a.play()
  a.addEventListener("ended", () => {
    a.remove()
  });
}


const deleteWord = (collectionName: string, word: string) => {
  if (localStorage.getItem(collectionName)) {
    const temp: Record<string, number> = JSON.parse(localStorage.getItem(collectionName)!)
    if (temp.hasOwnProperty(word)) {
      delete temp[word]
      localStorage.setItem(collectionName, JSON.stringify(temp))
      console.log('deleteWord', word, 'from', collectionName)
    }
  }
}



const setHistory = (word: string, count: number) => {
  if (localStorage.getItem('learningHistory')) {
    const temp = JSON.parse(localStorage.getItem('learningHistory')!)
    temp[word] = count
    localStorage.setItem('learningHistory', JSON.stringify(temp))
    deleteWord('dailyWordCollection', word)
  }
}

const addHistory = (word: string, count: number) => {
  let baseCount = 0
  const temp = JSON.parse(localStorage.getItem('learningHistory')!) || {}
  if (temp.hasOwnProperty(word)) {
    baseCount = temp[word]
  }
  setHistory(word, baseCount + count)
}

const markWord = (action: string) => {
  console.log("WordDetail -> markWord ->", props.wordName, action)
  switch (action) {
    case 'know':
      // if mark to know, set count+3 
      addHistory(props.wordName, 3)
      break;
    case 'maybeKnow':
      // if mark to maybeKnow, set count+3
      addHistory(props.wordName, 1)
      break;
    case 'unknow':
      // if mark to unknow, set 0
      setHistory(props.wordName, 0)
      break;
    default:
      break;
  }
  // call WordList component to flush today words
  emit('callWordList', 'reloadDailyWordCollection' + Math.random())

  // auto play action
  if (localStorage.getItem('autoLoadNextWord') == 'on') {
    const words = Object.keys(JSON.parse(localStorage.getItem('dailyWordCollection')!))
    const nextIndex = Math.round(Math.random() * (words.length - 1))
    console.log('markWord -> autoNext -> ', words[nextIndex])
    emit('setCurrentWordName', words[nextIndex])
  }
  else {
    emit('setCurrentWordName', '')
  }

}

onBeforeMount(() => {
  getFile('detail/' + props.wordName + '.json', parseJson, setDetail)
})


const getMarkedSentence = (text: string) => {
  let placeholder = props.wordName
  let start = text.indexOf(props.wordName);
  if (start < 0) {
    placeholder = placeholder.replace(/^\S/, s => s.toUpperCase());
    start = text.indexOf(placeholder);
  }
  if (start < 0) {
    return text
  } else {
    return text.slice(0, start) + '<span class=detail-word-inline>' + placeholder + '</span>' + text.slice(start + props.wordName.length, text.length)
  }
}

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
