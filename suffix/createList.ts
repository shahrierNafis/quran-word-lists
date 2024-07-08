import fs from "fs";
import { List, Word, WordCount } from "../types";
import path from "path";
import { descriptions } from "./descriptions";
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
const list: List = {};
for (const surah in data) {
  for (const verse in data[surah]) {
    for (const position in data[surah][verse]) {
      const word = data[surah][verse][position] as Word;
      // group by suffix prefix
      for (const suffix of [...(word.suffixes ?? [])]) {
        const SuffixGroupName = getSuffixGroupName(suffix, word);
        const suffixGroup = list[SuffixGroupName] ?? {
          positions: [] as string[],
        };
        suffixGroup.positions.push(`${surah}:${verse}:${position}`);
        suffixGroup.name = SuffixGroupName;
        suffixGroup.description = getDescription(SuffixGroupName) ?? suffix;
        list[SuffixGroupName] = suffixGroup;
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
  path.join(__dirname, "suffixList.json"),

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
function getDescription(suffix: string) {
  let description = descriptions[suffix] ?? "";
  if (suffix.includes("PRON:")) {
    if (suffix.split(":")[1].includes("1")) {
      description += "1st person";
    }
    if (suffix.split(":")[1].includes("2")) {
      description += "2nd person";
    }
    if (suffix.split(":")[1].includes("3")) {
      description += "3rd person";
    }
    if (suffix.split(":")[1].includes("S")) {
      description += " singular";
    }
    if (suffix.split(":")[1].includes("D")) {
      description += " dual";
    }
    if (suffix.split(":")[1].includes("P")) {
      description += " plural";
    }
    if (suffix.split(":")[1].includes("M")) {
      description += " masculine";
    }
    if (suffix.split(":")[1].includes("F")) {
      description += " feminine";
    }
    if (suffix.split("-").some((a) => a.includes("SUB"))) {
      description += " subject";
    }
    if (suffix.split("-").some((a) => a == "OBJ")) {
      description += " object";
    }
    if (suffix.split("-").some((a) => a.includes("OBJ_POS"))) {
      description += " object/possessive";
    }
    if (suffix.split("-").some((a) => a == "POS")) {
      description += " possessive";
    }
    description += ` pronoun`;
  }
  return description;
}
function getSuffixGroupName(suffix: string, word: Word) {
  if (
    suffix
      .split("-")
      .some((segment) => segment === "OBJ" || segment === "POS") &&
    !suffix.endsWith("PRON:1S")
  ) {
    return "OBJ_POS-" + "PRON:" + suffix.split(":")[1];
  }
  return suffix;
}
