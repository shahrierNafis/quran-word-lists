import fs from "fs";
import _ from "lodash";
import { Word, WordCount } from "./types";

let index = 0;
const wordCount: WordCount = require("./wordCount.json");
const data = {};
const translation = fs
  .readFileSync("./word-by-word.txt")
  .toString()
  .split("\n");
const morphology = fs.readFileSync("./morphology.txt").toString().split("\n");

for (const surah in wordCount) {
  for (const verce in (wordCount as WordCount)[surah]) {
    let wordIndex = 0;
    while (+wordCount[surah][verce] - wordIndex) {
      wordIndex++;

      if (morphology[index].split("	").includes("POS:INL")) {
        index++;
        continue;
      }

      const word = {} as Word;
      word.translation = translation[index];
      word.root = getRoot(morphology[index]);
      word.lemma = getLemma(morphology[index]);
      word.position = `${surah}:${verce}:${wordIndex}`;
      word.arPartOfSpeech = getArPos(morphology[index]);
      word.partOfSpeech = getPos(morphology[index]);
      word.prefixes = getPrefixes(morphology[index]);
      word.suffixes = getSuffixes(morphology[index]);
      //set word
      _.setWith(data, [surah, verce, wordIndex], word, Object);
      index++;
    }
  }
}
// write data
fs.writeFile("data.json", JSON.stringify(data), function (err) {
  if (err) throw err;
  console.log("complete");
});
// helper functions
function getRoot(line: string) {
  for (const segment of line.split(" ")) {
    if (segment.startsWith("ROOT")) {
      return segment.substring(5);
    }
  }
  return null;
}
function getLemma(line: string) {
  for (const segment of line.split(" ")) {
    if (segment.startsWith("LEM")) {
      return segment.substring(4);
    }
  }
  return null;
}

function getPos(line: string) {
  for (const segment of line.split(" ")) {
    if (segment.startsWith("POS")) {
      return segment.substring(4);
    }
  }
  return null;
}
function getArPos(line: string) {
  if (
    ["N", "PN", "ADJ", "IMPN", "PRON", "DEM", "REL", "T", "LOC"].includes(
      getPos(line) ?? ""
    )
  ) {
    return "ism";
  } else if (getPos(line) === "V") {
    return "fiʿil";
  } else if (getPos(line)) {
    return "ḥarf";
  }
  return null;
}

function getPrefixes(line: string) {
  const prefixes = [];
  for (const segment of line.split(" ")) {
    if (segment.endsWith("+")) {
      prefixes.push(segment);
    }
  }
  return prefixes;
}
function getSuffixes(line: string) {
  const suffixes = [];
  for (const segment of line.split(" ")) {
    if (segment.startsWith("+")) {
      suffixes.push(segment);
    }
    if (segment.startsWith("PRON:")) {
      suffixes.push(segment);
    }
  }
  return suffixes;
}
