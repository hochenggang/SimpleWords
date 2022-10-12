

import { getDate, wordCollectionContent, wordCollectionName, wordListContent, wordListLimit,wordListId } from './shared';

const buildWordListContent = (limit: number) => {
    console.log("buildWordListContent -> start. limit=", limit);
    if (!wordCollectionContent.value) { return }
    wordListContent.value = {};

    // get history
    let yourHistory: Record<string, number> = {};
    if (localStorage.getItem('learningHistory')) {
        yourHistory = JSON.parse(localStorage.getItem('learningHistory') as string);
    }

    // shuffle
    wordCollectionContent.value.sort(() => Math.random() - 0.5);

    // remove old words
    Object.keys(yourHistory).forEach((word) => {
        const tempIndex = wordCollectionContent.value.indexOf(word);
        if (tempIndex != -1) {
            delete wordCollectionContent.value[tempIndex];
        }
    })

    // set end index
    let indexEnd = 0;
    if (wordCollectionContent.value.length >= limit) {
        indexEnd = limit;
    } else {
        indexEnd = wordCollectionContent.value.length - 1;
    }
    console.log("buildWordListContent -> ", indexEnd, ' will be pull.');

    // get new words
    wordCollectionContent.value?.slice(0, indexEnd).forEach((word) => {
        wordListContent.value[word] = 0;
    })

    // get review words
    Object.keys(yourHistory).forEach((word) => {
        // if remember time less than 10 , push to review
        if (yourHistory[word] < 10) {
            wordListContent.value[word] = yourHistory[word] as number;
        }
    })
    localStorage.setItem('wordListContent', JSON.stringify(wordListContent.value));
    localStorage.setItem('wordListId', wordListId.value);


}


export { buildWordListContent };