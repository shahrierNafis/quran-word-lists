import fs from "fs";
import _ from "lodash";
let index = 0;
let prevPosition: string;
const wordCount = {};
const data = {};
const translation = fs
  .readFileSync("./word-by-word.txt")
  .toString()
  .split("\n");

fs.readFileSync("./extendedMorphology.txt")
  .toString()
  .split("\n")
  .forEach((line) => {
    const lineSegments = line.split("	");
    const position = lineSegments[0].substring(1, lineSegments[0].length - 3);
    if (prevPosition && position !== prevPosition) {
      index++;
    }

    //set word count
    _.setWith(
      wordCount,
      [position.split(":")[0], position.split(":")[1]],
      position.split(":")[2],
      Object
    );

    // get word
    const word = _.get(data, position.split(":"), {});

    // set word translation
    word.translation = translation[index];

    // set part of speech
    if (!isPrefix(line) && !isSuffix(line)) {
      if (isFiil(line)) {
        word.arPartOfSpeech = "fiʿil";
      } else if (isIsm(line)) {
        word.arPartOfSpeech = "ism";
      } else {
        word.arPartOfSpeech = "ḥarf";
      }
      word.root = getRoot(line) ?? word.root ?? null;
      word.lemma = getLemma(line) ?? word.lemma ?? null;
      word.partOfSpeech = getPos(line) ?? word.partOfSpeech ?? null;
    }

    word.position = position;

    prevPosition = position;
    _.setWith(data, position.split(":"), word, Object);
  });

// write data
fs.writeFile("extentedData.json", JSON.stringify(data), function (err) {
  if (err) throw err;
  console.log("complete");
});
fs.writeFile("wordCount.json", JSON.stringify(wordCount), function (err) {
  if (err) throw err;
  console.log("complete");
});

// helper functions
function isPrefix(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("PREFIX")) {
      return true;
    }
  }
  return false;
}
function isSuffix(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("SUFFIX")) {
      return true;
    }
  }
  return false;
}
function isIsm(line: string) {
  for (const key of [
    "N",
    "PN",
    "ADJ",
    "IMPN",
    "PRON",
    "DEM",
    "REL",
    "T",
    "LOC",
  ]) {
    if (line.split("	").includes(key)) {
      return true;
    }
  }
  return false;
}
function isFiil(line: string) {
  if (line.split("	").includes("V")) {
    return true;
  }
  return false;
}
function getRoot(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("STEM")) {
      for (const seg of segment.split("|")) {
        if (seg.startsWith("ROOT")) {
          return seg.substring(5);
        }
      }
    }
  }
}
function getLemma(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("STEM")) {
      for (const seg of segment.split("|")) {
        if (seg.startsWith("LEM")) {
          return seg.substring(4);
        }
      }
    }
  }
}

function getPos(line: string) {
  for (const segment of line.split("	")) {
    if (segment.startsWith("STEM")) {
      for (const seg of segment.split("|")) {
        if (seg.startsWith("POS")) {
          return seg.substring(4);
        }
      }
    }
  }
}
