import fs from "fs";
import { List, Word, WordCount } from "../types";
import path from "path";
import { descriptions } from "./descriptions";
const wordCount: WordCount = require("../wordCount.json");
const bt = require("buckwalter-transliteration")("bw2utf");

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

const data: Data = require("../data.json");
const list: List = {};

for (const surah in data) {
  for (const verse in data[surah]) {
    for (const position in data[surah][verse]) {
      const word = data[surah][verse][position] as Word;
      if (word.arPartOfSpeech == "ḥarf") {
        if (word.suffixes?.length || word.prefixes?.length) {
          continue;
        }
        const group = list[word.partOfSpeech! + word.lemma] ?? {
          positions: [],
        };
        group.name = bt(word.lemma) + " " + word.partOfSpeech ?? "";
        group.description =
          bt(word.lemma) + ": " + descriptions[word.partOfSpeech ?? ""];
        group.positions.push(`${surah}:${verse}:${position}`);
        list[word.partOfSpeech! + word.lemma] = group;
      }
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
  path.join(__dirname, "harfList.json"),

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
      return arr.positions.length;
    })
  ),
  function (err) {
    if (err) throw err;
    console.log("complete");
  }
);
