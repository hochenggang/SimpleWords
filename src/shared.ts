import { computed, ref, watch } from "vue";

const getDate = () => {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
const REQUESTING_COUNT = ref(0);

// varibles about word collection
const wordCollectionName = ref(localStorage.getItem('wordCollectionName')?localStorage.getItem('wordCollectionName') as string:'');
const wordCollectionContent = ref<string[]>([]);
const wordCollectionNames = ref<string[]>([]);

// varibles about word list
const wordListContent = ref<Record<string, number>>({});
const wordListLimit = ref(localStorage.getItem('wordListLimit')?Number(localStorage.getItem('wordListLimit')):20);
const todayFinishedNum = ref(localStorage.getItem('todayFinishedNum')?Number(localStorage.getItem('todayFinishedNum')):0);
const currentWord = ref('');
const autoPlayStatus = ref(localStorage.getItem('autoPlayStatus') || 'off');
const autoPlayType = ref(localStorage.getItem('autoPlayType') || 'am');
const autoLoadNextWord = ref(localStorage.getItem('autoLoadNextWord') || 'off');
const wordListId = computed(()=>getDate() + wordCollectionName.value + wordListLimit.value);
const currentWordDetail = ref<{
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
  }|null>()
  
export { getDate, 
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
    currentWordDetail,
    wordListId,
};
