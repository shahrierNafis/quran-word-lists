const quran = require("quran-db");
import fs from "fs";
import { Word } from "../types";
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
const list: List = {};
const dictionary: { [key: string]: string | null } = {};
const cluster: List = {};
for (const surah in data) {
  for (const verce in data[surah]) {
    for (const position in data[surah][verce]) {
      const word = data[surah][verce][position] as Word;

      // group by suffix prefix
      for (const string of word.prefixes.concat(word.suffixes)) {
        const affixGroup = list[string] ?? ([] as string[]);
        affixGroup.push(`${surah}:${verce}:${position}`);
        list[string] = affixGroup;
      }
      // group by lemma
      const lemmaGroup = cluster[word.lemma ?? "noLemma"] ?? ([] as string[]);

      // add word to the group
      lemmaGroup.push(`${surah}:${verce}:${position}`);
      dictionary[`${surah}:${verce}:${position}`] = word.lemma ?? null;
      // update list
      cluster[word.lemma ?? "noLemma"] = lemmaGroup;
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
fs.writeFile(
  path.join(__dirname, "cluster.json"),
  JSON.stringify(cluster),
  function (err) {
    if (err) throw err;
    console.log("complete");
  }
);
fs.writeFile(
  path.join(__dirname, "dictionary.json"),
  JSON.stringify(dictionary),
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
