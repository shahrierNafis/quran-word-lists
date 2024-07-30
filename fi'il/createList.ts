import fs from "fs";
import path from "path";
import { List, Word, WordCount } from "../types";
import { forIn } from "lodash";
import addOptions from "../lib/addOptionsIsm&Fill";
const wordCount: WordCount = require("../wordCount.json");
const bt = require("buckwalter-transliteration")("bw2utf");

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: Word;
    };
  };
};

const data: Data = require("../data.json");
const list: List = {};

for (const surah in data) {
  for (const verse in data[surah]) {
    for (const position in data[surah][verse]) {
      const word = data[surah][verse][position];
      if (word.arPartOfSpeech != "fiʿil" || !word.lemma) {
        continue;
      }

      const lemmaGroup = list[word.lemma] ?? {
        positions: [],
      };

      // add word to the groups
      lemmaGroup.positions.push(`${surah}:${verse}:${position}`);
      lemmaGroup.name = "";
      lemmaGroup.description = bt(word.lemma);
      list[word.lemma] = lemmaGroup;
    }
  }
}

const sortedList = Object.values(list)
  .map((wordGroup) => {
    wordGroup.positions = wordGroup.positions.sort((indexA, indexB) => {
      const [surahA, verseA] = indexA.split(":");
      const [surahB, verseB] = indexB.split(":");
      return +wordCount[surahA][verseA] - +wordCount[surahB][verseB];
    });
    return wordGroup;
  })
  .sort((wordGroupA, wordGroupB) => {
    return wordGroupB.positions.length - wordGroupA.positions.length;
  });

// write lists
fs.writeFile(
  path.join(__dirname, "fi'lList.json"),

  JSON.stringify(addOptions(sortedList)),
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
      return arr.positions.length;
    })
  ),
  function (err) {
    if (err) throw err;
    console.log("complete");
  }
);
