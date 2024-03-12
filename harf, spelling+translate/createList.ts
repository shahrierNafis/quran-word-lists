const quran = require("quran-db");
import fs from "fs";
import { Word } from "../types";
import { SpellingData } from "../types";
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
      if (word.arPartOfSpeech == "ḥarf") {
        const spelling =
          spellingData[surah][verse][+position - 1].transliteration.text.trim();
        console.log({ surah, verse, position }, spelling);
        // group by spelling+translation
        const group =
          list[spelling + cleanTranslation(word.translation)] ??
          ([] as string[]);

        group.push(`${surah}:${verse}:${position}`);
        list[spelling + cleanTranslation(word.translation)] = group;
      }
    }
  }
}

const sortedList = Object.values(list).sort((a, b) => {
  return b.length - a.length;
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
function cleanTranslation(string: string) {
  return string
    .toLowerCase()
    .replace(/[.,;\[\]'"`\\]|(\(.*\))|(  )/g, "")
    .trim();
}
