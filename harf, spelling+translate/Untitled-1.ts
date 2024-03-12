import fs from "fs";
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

const spellingData: {
  [key: string]: { [key: string]: SpellingData[] };
} = require("../spellingData.json");

const dataCount = Object.keys(data).map(
  (surah) => Object.keys(data[surah]).length
);
const spellingDataCount = Object.keys(spellingData).map(
  (surah) => Object.keys(spellingData[surah]).length
);

fs.writeFile(
  path.join(__dirname, "dataCount.json"),

  JSON.stringify(dataCount),
  function (err) {
    if (err) throw err;
    console.log("complete");
  }
);
fs.writeFile(
  path.join(__dirname, "spellingDataCount.json"),

  JSON.stringify(spellingDataCount),
  function (err) {
    if (err) throw err;
    console.log("complete");
  }
);
