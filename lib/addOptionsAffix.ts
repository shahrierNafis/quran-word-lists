import { Word } from "../types";

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: Word;
    };
  };
};
const data: Data = require("../data.json");

export default function addOptionsAffix(
  list: {
    positions: string[];
    description: string;
    name: string;
    keys: Set<string>;
  }[]
) {
  return list.map((group) => {
    const options = [];
    const dataArray = [];
    for (const chapter in data) {
      for (const verse in data[chapter]) {
        for (const word in data[chapter][verse]) {
          dataArray.push(data[chapter][verse][word]);
        }
      }
    }
    const ranDataArray = dataArray.sort(() => Math.random() - 0.5);
    for (const wordData of ranDataArray) {
      const [surah, ayah, kalaam] = group.positions[0].split(":");

      if (options.length == 3) {
        break;
      }
      if (wordData.lemma == data[surah][ayah][kalaam].lemma) {
        if (!hasCommonAffix(group, wordData)) {
          if (!hasSameLammaNAffixes(options, wordData)) {
            options.push(wordData.position);
          }
        }
      }
    }
    if (options.length != 3) {
      for (const wordData of ranDataArray) {
        const [surah, ayah, kalaam] = group.positions[0].split(":");

        if (options.length == 3) {
          break;
        }
        if (wordData.root == data[surah][ayah][kalaam].root) {
          if (!hasCommonAffix(group, wordData)) {
            if (!hasSameLammaNAffixes(options, wordData)) {
              options.push(wordData.position);
            }
          }
        }
      }
      if (options.length != 3) {
        for (const wordData of ranDataArray) {
          const [surah, ayah, kalaam] = group.positions[0].split(":");

          if (options.length == 3) {
            break;
          }
          if (wordData.partOfSpeech == data[surah][ayah][kalaam].partOfSpeech) {
            if (!hasCommonAffix(group, wordData)) {
              if (!hasSameLammaNAffixes(options, wordData)) {
                options.push(wordData.position);
              }
            }
          }
        }
      }
      if (options.length != 3) {
        for (const wordData of ranDataArray) {
          if (options.length == 3) {
            break;
          }
          if (!hasCommonAffix(group, wordData)) {
            if (!hasSameLammaNAffixes(options, wordData)) {
              options.push(wordData.position);
            }
          }
        }
      }
    }

    return {
      ...group,
      options,
    };
  });
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
function hasSamePrefixes(wordData1: Word, wordData2: Word) {
  return wordData1.prefixes?.sort().join() == wordData2.prefixes?.sort().join();
}
function hasSameLammaNAffixes(options: string[], wordData: Word) {
  return options.some((option) => {
    const [surah, ayah, kalaam] = option.split(":");
    return (
      wordData.lemma == data[surah][ayah][kalaam].lemma &&
      hasSameSuffixes(wordData, data[surah][ayah][kalaam]) &&
      hasSamePrefixes(wordData, data[surah][ayah][kalaam])
    );
  });
}
function hasCommonAffix(
  group: {
    positions: string[];
    description: string;
    name: string;
    keys: Set<string>;
  },
  wordData: Word
) {
  const affixes = [
    ...(wordData.prefixes ?? []),
    ...(wordData.suffixes?.map((s) => s.PGN) ?? []),
  ];
  return affixes.some((a) => {
    return group.keys.has(a);
  });
}
