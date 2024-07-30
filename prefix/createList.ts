import fs from "fs";
import { Word, WordCount } from "../types";
import path from "path";
import { descriptions } from "./descriptions";
import addOptionsAffix from "../lib/addOptionsAffix";
const wordCount: WordCount = require("../wordCount.json");

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
const list: {
  [key: string]: {
    positions: string[];
    description: string;
    name: string;
    keys: Set<string>;
  };
} = {};
for (const surah in data) {
  for (const verse in data[surah]) {
    for (const position in data[surah][verse]) {
      const word = data[surah][verse][position] as Word;
      // group by suffix prefix
      for (const prefix of [...(word.prefixes ?? [])]) {
        const PrefixGroupName = getPrefixGroupName(prefix);
        const prefixGroup = list[PrefixGroupName] ?? {
          positions: [] as string[],
          keys: new Set(),
        };
        prefixGroup.positions.push(`${surah}:${verse}:${position}`);
        prefixGroup.name = PrefixGroupName;
        prefixGroup.description = descriptions[PrefixGroupName] ?? prefix;
        prefixGroup.keys.add(prefix);
        list[PrefixGroupName] = prefixGroup;
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
  path.join(__dirname, "prefixList.json"),

  JSON.stringify(addOptionsAffix(sortedList)),

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

function getPrefixGroupName(prefix: string) {
  if (prefix.includes(":")) {
    return prefix.split(":")[0] + "+";
  }
  return prefix;
}
