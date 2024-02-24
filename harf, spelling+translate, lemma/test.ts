const quran = require("quran-db");
import fs from "fs";
import { Word } from "../types";
import path from "path";
import _ from "lodash";
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
  [key: string]: {
    [key: string]: string[];
  };
};
const data: Data = require("../data.json");
const list: List = {};
const dictionary: { [key: string]: string | null } = {};
const cluster: { [key: string]: string[] } = {};
for (const surah in data) {
  for (const verce in data[surah]) {
    for (const position in data[surah][verce]) {
      const word = data[surah][verce][position] as Word;
      if (word.arPartOfSpeech == "ḥarf") {
        const speling =
          quran.getVerse(+surah, +verce).split(" ")[+position - 1] ?? "";
        // group by speling+translation
        const group = _.get(
          list,
          [speling, speling + cleanTranslation(word.translation)],
          [] as string[]
        );

        group.push(`${surah}:${verce}:${position}:${word.translation}`);
        // group by lemma
        const lemmaGroup = cluster[word.lemma ?? "noLemma"] ?? ([] as string[]);

        // add word to the group
        lemmaGroup.push(`${surah}:${verce}:${position}`);
        dictionary[`${surah}:${verce}:${position}`] = word.lemma ?? null;
        // update list
        _.setWith(
          list,
          [speling, speling + cleanTranslation(word.translation)],
          group,
          Object
        );
        cluster[word.lemma ?? "noLemma"] = lemmaGroup;
      }
    }
  }
}

const sortedList = Object.values(list).sort((a, b) => {
  return (
    Object.values(b).reduce((acc, val) => acc + val.length, 0) -
    Object.values(a).reduce((acc, val) => acc + val.length, 0)
  );
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
    sortedList.map((arrarr) => {
      return Object.values(arrarr).map((arr) => {
        return arr.length;
      });
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
