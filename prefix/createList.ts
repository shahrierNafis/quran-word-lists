import fs from "fs";
import { Word, WordCount } from "../types";
import path from "path";
import { descriptions } from "./descriptions";
const wordCount: WordCount = require("../wordCount.json");

type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: Word;
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
      if (word.arPartOfSpeech === "fiʿil") {
        if (word.aspect == "IMPF") {
          if (word.PGN == "1S") {
            const PrefixGroupName = "1S";
            const prefixGroup = list[PrefixGroupName] ?? {
              positions: [] as string[],
              keys: new Set(),
            };
            prefixGroup.positions.push(`${surah}:${verse}:${position}`);
            prefixGroup.name = PrefixGroupName;
            prefixGroup.description =
              "1st person singular pronoun prefix ا(alif) attached to an imperfect verb";
            prefixGroup.keys.add("1S");
            list[PrefixGroupName] = prefixGroup;
          } else if (word.PGN == "1P") {
            const PrefixGroupName = "1P";
            const prefixGroup = list[PrefixGroupName] ?? {
              positions: [] as string[],
              keys: new Set(),
            };
            prefixGroup.positions.push(`${surah}:${verse}:${position}`);
            prefixGroup.name = PrefixGroupName;
            prefixGroup.description =
              "1st person plural pronoun prefix نَ(na) attached to an imperfect verb";
            prefixGroup.keys.add("1P");
            list[PrefixGroupName] = prefixGroup;
          } else if (word.PGN?.startsWith("2")) {
            const PrefixGroupName = "2nd person";
            const prefixGroup = list[PrefixGroupName] ?? {
              positions: [] as string[],
              keys: new Set(),
            };
            prefixGroup.positions.push(`${surah}:${verse}:${position}`);
            prefixGroup.name = PrefixGroupName;
            prefixGroup.description =
              "2nd person pronoun prefix تَ(ta) attached to an imperfect verb";
            prefixGroup.keys.add("2MS");
            prefixGroup.keys.add("2MD");
            prefixGroup.keys.add("2MP");
            prefixGroup.keys.add("2FS");
            prefixGroup.keys.add("2FD");
            prefixGroup.keys.add("2FP");
            list[PrefixGroupName] = prefixGroup;
          } else if (word.PGN?.startsWith("3")) {
            if (word.PGN == "3FS") {
              const PrefixGroupName = "3FS";
              const prefixGroup = list[PrefixGroupName] ?? {
                positions: [] as string[],
                keys: new Set(),
              };
              prefixGroup.positions.push(`${surah}:${verse}:${position}`);
              prefixGroup.name = PrefixGroupName;
              prefixGroup.description =
                "3rd person singular feminine pronoun prefix تَ(ta) attached to an imperfect verb";
              prefixGroup.keys.add("3FS");
              prefixGroup.keys.add("2MS");
              prefixGroup.keys.add("2MD");
              prefixGroup.keys.add("2MP");
              prefixGroup.keys.add("2FS");
              prefixGroup.keys.add("2FD");
              prefixGroup.keys.add("2FP");
              list[PrefixGroupName] = prefixGroup;
            } else {
              const PrefixGroupName = "3rd person";
              const prefixGroup = list[PrefixGroupName] ?? {
                positions: [] as string[],
                keys: new Set(),
              };
              prefixGroup.positions.push(`${surah}:${verse}:${position}`);
              prefixGroup.name = PrefixGroupName;
              prefixGroup.description =
                "3rd person pronoun prefix یَ(ya) attached to an imperfect verb";
              prefixGroup.keys.add("3MS");
              prefixGroup.keys.add("3MD");
              prefixGroup.keys.add("3MP");

              prefixGroup.keys.add("3FD");
              prefixGroup.keys.add("3FP");
              list[PrefixGroupName] = prefixGroup;
            }
          }
        }
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
function addOptionsAffix(
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
        if (!hasKeyAffix(group, wordData)) {
          if (!hasDuplicateOptions(options, wordData)) {
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
          if (!hasKeyAffix(group, wordData)) {
            if (!hasDuplicateOptions(options, wordData)) {
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
            if (!hasKeyAffix(group, wordData)) {
              if (!hasDuplicateOptions(options, wordData)) {
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
          if (!hasKeyAffix(group, wordData)) {
            if (!hasDuplicateOptions(options, wordData)) {
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
function hasDuplicateOptions(options: string[], wordData: Word) {
  return options.some((option) => {
    const [surah, ayah, kalaam] = option.split(":");
    return (
      wordData.lemma == data[surah][ayah][kalaam].lemma &&
      hasSameSuffixes(wordData, data[surah][ayah][kalaam]) &&
      hasSamePrefixes(wordData, data[surah][ayah][kalaam])
    );
  });
}
function hasKeyAffix(
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
    wordData.aspect ?? "",
    wordData.PGN ?? "",
  ];
  return affixes.some((a) => {
    return group.keys.has(a);
  });
}
