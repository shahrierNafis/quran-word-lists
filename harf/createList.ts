import fs from "fs";
import { List, Word, WordCount } from "../types";
import path from "path";
import { descriptions } from "./descriptions";
import doesNotHaveSameLemma from "../lib/doesNotHaveSameLemma";
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

function addOptions(
  list: {
    positions: string[];
    description: string;
    name: string;
  }[]
) {
  return list.map((group) => {
    const options: string[] = [];
    const [surah, ayah, kalaam] = group.positions[0].split(":");
    const dataArray: Word[] = [];
    for (const chapter in data) {
      for (const verse in data[chapter]) {
        for (const position in data[chapter][verse]) {
          dataArray.push(data[chapter][verse][position]);
        }
      }
    }
    const ranDataArray = dataArray.sort(() => Math.random() - 0.5);
    for (const word of ranDataArray) {
      if (options.length == 3) {
        break;
      }
      if (word.arPartOfSpeech == "ḥarf") {
        if (doesNotHaveSameLemma([...options, group.positions[0]], word)) {
          if (word.partOfSpeech != data[surah][ayah][kalaam].partOfSpeech) {
            if (!(word.suffixes?.length || word.prefixes?.length)) {
              options.push(word.position);
            }
          }
        }
      }
    }
    return {
      name: group.name,
      description: group.description,
      positions: group.positions,
      options,
    };
  });
}
