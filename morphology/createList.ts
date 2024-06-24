const quran = require("quran-db");
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
      for (const affix of [
        // ...(word.prefixes ?? []),
        ...(word.suffixes ?? []),
      ]) {
        const AffixGroupName = getAffixGroupName(affix, word);
        const affixGroup = list[AffixGroupName] ?? {
          positions: [] as string[],
        };
        affixGroup.positions.push(`${surah}:${verse}:${position}`);
        affixGroup.name = AffixGroupName;
        affixGroup.description = getDescription(AffixGroupName) ?? affix;

        list[AffixGroupName] = affixGroup;
      }
      // [
      //   "aspect",
      //   "mood",
      //   "voice",
      //   "derivation",
      //   "state",
      //   "grammaticalCase",
      // ].forEach((key) => {
      //   if (["ACT"].includes(word[key as keyof Word] as string)) {
      //     // return;
      //   }
      //   if (word[key as keyof Word]) {
      //     const group = list[word[key as keyof Word] as string] ?? {
      //       positions: [] as string[],
      //     };
      //     group.positions.push(`${surah}:${verse}:${position}`);
      //     group.name = word[key as keyof Word] as string;
      //     group.description =
      //       getDescription(word[key as keyof Word] as string) ??
      //       word[key as keyof Word];
      //     list[word[key as keyof Word] as string] = group;
      //   }
      //   // groups by form
      // });
      // if (word["form"] && word.aspect) {
      //   if (word.aspect != "PERF") {
      //     continue;
      //   }
      //   const group = list[word.form] ?? {
      //     positions: [] as string[],
      //   };
      //   group.name = "form " + word.form;
      //   group.positions.push(`${surah}:${verse}:${position}`);
      //   group.description = getDescription(word.form) ?? word.form;
      //   list[word.form] = group;
      // }
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
  path.join(__dirname, "morphologyList.json"),

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
function getDescription(affix: string) {
  let description = descriptions[affix] ?? "";
  if (affix.includes("PRON:")) {
    if (affix.split(":")[1].includes("1")) {
      description += "1st person";
    }
    if (affix.split(":")[1].includes("2")) {
      description += "2nd person";
    }
    if (affix.split(":")[1].includes("3")) {
      description += "3rd person";
    }
    if (affix.split(":")[1].includes("S")) {
      description += " singular";
    }
    if (affix.split(":")[1].includes("D")) {
      description += " dual";
    }
    if (affix.split(":")[1].includes("P")) {
      description += " plural";
    }
    if (affix.split(":")[1].includes("M")) {
      description += " masculine";
    }
    if (affix.split(":")[1].includes("F")) {
      description += " feminine";
    }
    if (affix.split("-").some((a) => a.includes("SUB"))) {
      description += " subject";
    }
    if (affix.split("-").some((a) => a.includes("OBJ"))) {
      description += " object";
    }
    if (affix.split("-").some((a) => a.includes("OBJ_POS"))) {
      description += " object/possessive";
    }
    if (affix.split("-").some((a) => a.includes("POS"))) {
      description += " possessive";
    }
    description += ` pronoun`;
    if (affix.split("-").some((a) => a.includes("PERF"))) {
      description += " attached to a perfect verb";
    }
    if (affix.split("-").some((a) => a.includes("IMPF"))) {
      description += " attached to an imperfect verb";
    }
    if (affix.split("-").some((a) => a.includes("IMPV"))) {
      description += " attached to an imperative verb";
    }
  }
  return description;
}
function getAffixGroupName(affix: string, word: Word) {
  if (affix.split("-").some((a) => a.startsWith("SUB")) && word.aspect) {
    return word.aspect + "-" + affix;
  }
  if (
    affix
      .split("-")
      .some((segment) => segment === "OBJ" || segment === "POS") &&
    !affix.endsWith("PRON:1S")
  ) {
    return "OBJ_POS-" + "PRON:" + affix.split(":")[1];
  }
  return affix;
}
