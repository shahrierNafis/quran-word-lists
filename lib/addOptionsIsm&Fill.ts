import { Word } from "../types";
import doesNotHaveSameLemma from "./doesNotHaveSameLemma";

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: Word;
    };
  };
};

const data: Data = require("../data.json");
export default function addOptions(
  list: {
    positions: string[];
    description: string;
    name: string;
  }[]
) {
  const newList: typeof list & { options: string[] }[] = [];
  const dataArray = [];
  for (const chapter in data) {
    for (const verse in data[chapter]) {
      for (const word in data[chapter][verse]) {
        dataArray.push(data[chapter][verse][word]);
      }
    }
  }
  for (const group of list) {
    const [surah, ayah, kalaam] = group.positions[0].split(":");
    const options = [];
    const ranDataArray = dataArray.sort(() => Math.random() - 0.5);

    for (const wordData of ranDataArray) {
      if (options.length == 3) {
        break;
      }
      if (
        isTheSamePS(wordData, data[surah][ayah][kalaam]) &&
        doesNotHaveSameLemma([...options, group.positions[0]], wordData) &&
        hasSameSuffixes(wordData, data[surah][ayah][kalaam]) &&
        hasSamePrefixes(wordData, data[surah][ayah][kalaam])
      ) {
        options.push(wordData.position);
      }
    }

    if (options.length != 3) {
      for (const wordData of ranDataArray) {
        if (options.length == 3) {
          break;
        }
        if (
          isTheSamePS(wordData, data[surah][ayah][kalaam]) &&
          doesNotHaveSameLemma([...options, group.positions[0]], wordData) &&
          hasSameSuffixesNoSub(wordData, data[surah][ayah][kalaam]) &&
          hasSamePrefixes(wordData, data[surah][ayah][kalaam])
        ) {
          options.push(wordData.position);
        }
      }
    }
    if (data[surah][ayah][kalaam].suffixes?.length == 0) {
      if (options.length != 3) {
        for (const wordData of ranDataArray) {
          if (options.length == 3) {
            break;
          }
          if (
            isTheSamePS(wordData, data[surah][ayah][kalaam]) &&
            doesNotHaveSameLemma([...options, group.positions[0]], wordData) &&
            hasSamePrefixes(wordData, data[surah][ayah][kalaam])
          ) {
            options.push(wordData.position);
          }
        }
      }
      if (options.length != 3) {
        for (const wordData of ranDataArray) {
          if (options.length == 3) {
            break;
          }
          if (
            doesNotHaveSameLemma([...options, group.positions[0]], wordData) &&
            hasSamePrefixes(wordData, data[surah][ayah][kalaam])
          ) {
            options.push(wordData.position);
          }
        }
      }
    } else {
      if (options.length != 3) {
        for (const wordData of ranDataArray) {
          if (options.length == 3) {
            break;
          }
          if (
            isTheSamePS(wordData, data[surah][ayah][kalaam]) &&
            doesNotHaveSameLemma([...options, group.positions[0]], wordData) &&
            hasSameSuffixesNoSub(wordData, data[surah][ayah][kalaam])
          ) {
            options.push(wordData.position);
          }
        }
      }
      if (options.length != 3) {
        for (const wordData of ranDataArray) {
          if (options.length == 3) {
            break;
          }
          if (
            doesNotHaveSameLemma([...options, group.positions[0]], wordData) &&
            hasSameSuffixesNoSub(wordData, data[surah][ayah][kalaam])
          ) {
            options.push(wordData.position);
          }
        }
      }
      if (options.length != 3) {
        for (const wordData of ranDataArray) {
          if (options.length == 3) {
            break;
          }
          if (
            doesNotHaveSameLemma([...options, group.positions[0]], wordData)
          ) {
            options.push(wordData.position);
          }
        }
      }
    }
    newList.push({ ...group, options });
  }
  console.log(
    JSON.stringify(
      newList.filter((nli) => {
        return (
          (nli as (typeof list)[1] & { options: string[] }).options.length != 3
        );
      })
    )
  );

  return newList;
}
function isTheSamePS(wordData1: Word, wordData2: Word) {
  return wordData1.partOfSpeech == wordData2.partOfSpeech;
}
function hasSameSuffixes(wordData1: Word, wordData2: Word) {
  return (
    wordData1.suffixes
      ?.map((s) => s.PGN)
      .sort()
      .join() ==
    wordData2.suffixes
      ?.map((s) => s.PGN)
      .sort()
      .join()
  );
}
function hasSameSuffixesNoSub(wordData1: Word, wordData2: Word) {
  return (
    wordData1.suffixes
      ?.map((s) => {
        if (!s.PGN.startsWith("SUB")) {
          return s.PGN;
        }
        return "";
      })
      .sort()
      .join() ==
    wordData2.suffixes
      ?.map((s) => {
        if (!s.PGN.startsWith("SUB")) {
          return s.PGN;
        }
        return "";
      })
      .sort()
      .join()
  );
}
function hasSamePrefixes(wordData1: Word, wordData2: Word) {
  return wordData1.prefixes?.sort().join() == wordData2.prefixes?.sort().join();
}
