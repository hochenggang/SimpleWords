import { ref, watch } from "vue";
import { getDate, REQUESTING_COUNT, wordCollectionName, wordCollectionNames, wordCollectionContent, wordListContent } from './shared';

const HOST = "https://words.imhcg.cn";

// fetch(url)
// .then((res) => res.json())
// .then((json) => (data.value = json))
// .catch((err) => (error.value = err))
function getWordCollectionNames() {
  REQUESTING_COUNT.value += 1
  return fetch(HOST + "/collins/collection/names.json")
}

function getWordCollection(name: string) {
  REQUESTING_COUNT.value += 1
  return fetch(HOST + `/collins/collection/${name}.json`)
}

function getWord(name: string) {
  REQUESTING_COUNT.value += 1
  return fetch(HOST + `/collins/detail/${name}.json`)
}




export { REQUESTING_COUNT, HOST, getWordCollectionNames, getWordCollection, getWord };
