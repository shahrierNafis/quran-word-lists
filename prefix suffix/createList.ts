const quran = require("quran-db");
import fs from "fs";
import { SpellingData, Word } from "../types";
import path from "path";
type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        translation: string;
        root: string | null;
        lemma: string | null;
        partOfSpeech: string;
        arPartOfSpeech: string;
      };
    };
  };
};
type List = {
  [key: string]: string[];
};
const data: Data = require("../data.json");
const spellingData: SpellingData = require("../spellingData.json");
const list: List = {};
for (const surah in data) {
  for (const verse in data[surah]) {
    for (const position in data[surah][verse]) {
      const word = data[surah][verse][position] as Word;

      // group by suffix prefix
      for (const string of word.prefixes.concat(word.suffixes)) {
        const affixGroup = list[string] ?? ([] as string[]);
        affixGroup.push(`${surah}:${verse}:${position}`);
        list[string] = affixGroup;
      }
    }
  }
}

const sortedList = Object.values(list)
  .map((wordGroup) =>
    wordGroup.sort((indexA, indexB) => {
      const [surahA, verseA, positionA] = indexA.split(":");
      const [surahB, verseB, positionB] = indexB.split(":");
      return (
        spellingData[surahA][verseA].length -
        spellingData[surahB][verseB].length
      );
    })
  )
  .sort((wordGroupA, wordGroupB) => {
    return wordGroupB.length - wordGroupA.length;
  });
// write lists
fs.writeFile(
  path.join(__dirname, "list.json"),

  JSON.stringify(sortedList),
  function (err) {
    if (err) throw err;
    console.log("complete");
  }
);

// write listCount
fs.writeFile(
  path.join(__dirname, "listCount.json"),
  JSON.stringify(
    sortedList.map((arr) => {
      return arr.length;
    })
  ),
  function (err) {
    if (err) throw err;
    console.log("complete");
  }
);
