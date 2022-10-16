import { computed, ref, watch, watchEffect } from "vue";

const getDate = () => {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

// for request loading
const REQUESTING_COUNT = ref(0);

// varibles about word collection
const wordCollectionName = ref(localStorage.getItem('wordCollectionName') ? localStorage.getItem('wordCollectionName') as string : '');
const wordCollectionContent = ref<string[]>([]);
const wordCollectionNames = ref<string[]>([]);

// varibles about word list
const wordListContent = ref<Record<string, number>>({});
watch(wordListContent, () => {
  console.log('wordListContent resave.')
  localStorage.setItem('wordListContent', JSON.stringify(wordListContent.value));
}, { deep: true })

const wordListLimit = ref(localStorage.getItem('wordListLimit') ? Number(localStorage.getItem('wordListLimit')) : 20);
watch(wordListLimit, () => {
  console.log('wordListLimit resave.')
  localStorage.setItem('wordListLimit', String(wordListLimit.value));
})

const todayFinishedNum = ref(localStorage.getItem('todayFinishedNum') ? Number(localStorage.getItem('todayFinishedNum')) : 0);
watch(todayFinishedNum, () => {
  console.log('todayFinishedNum resave.')
  localStorage.setItem('todayFinishedNum', String(todayFinishedNum.value));
})

const autoPlayStatus = ref(localStorage.getItem('autoPlayStatus') || 'off');
watch(autoPlayStatus, () => {
  console.log('autoPlayStatus resave.')
  localStorage.setItem('autoPlayStatus', String(autoPlayStatus.value));
})
const autoPlayType = ref(localStorage.getItem('autoPlayType') || 'am');
watch(autoPlayType, () => {
  console.log('autoPlayType resave.')
  localStorage.setItem('autoPlayType', String(autoPlayType.value));
})
const autoLoadNextWord = ref(localStorage.getItem('autoLoadNextWord') || 'off');
watch(autoLoadNextWord, () => {
  console.log('autoLoadNextWord resave.')
  localStorage.setItem('autoLoadNextWord', String(autoLoadNextWord.value));
})

const wordListId = computed(() => getDate() + wordCollectionName.value + wordListLimit.value);
const wordQueryHistory = ref<string[]>([]);
const currentWord = computed(()=>wordQueryHistory.value[wordQueryHistory.value.length-1]);
const wordDetail = ref<{
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
} | null>()

export {
  getDate,
  REQUESTING_COUNT,
  wordCollectionName,
  wordCollectionNames,
  wordCollectionContent,
  wordListContent,
  wordListLimit,
  todayFinishedNum,
  currentWord,
  autoPlayStatus,
  autoPlayType,
  autoLoadNextWord,
  wordDetail,
  wordListId,
  wordQueryHistory,
};
