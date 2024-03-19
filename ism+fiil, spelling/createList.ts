import fs from "fs";
import path from "path";
import { SpellingData } from "../types";
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
      const word = data[surah][verse][position];
      if (word.arPartOfSpeech == "ḥarf") {
        continue;
      }
      const spelling =
        spellingData[surah][verse][+position - 1].transliteration.text.trim();
      // group by spelling
      const spellingGroup = list[spelling] ?? ([] as string[]);

      // add word to the groups
      spellingGroup.push(`${surah}:${verse}:${position}`);

      list[spelling] = spellingGroup;
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
