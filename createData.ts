import fs from "fs";
import _ from "lodash";
import { Word } from "./types";
let index = 0;
let prevPosition: string;
const wordCount = {};
const data: { [key: string]: Word } = {};
const translation = fs
  .readFileSync("./word-by-word.txt")
  .toString()
  .split("\n");
const pronounData: { [key: string]: string } = {};
fs.readFileSync("./morphology.txt")
  .toString()
  .split("\n")
  .forEach((line, lineIndex, lineArray) => {
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
    const word: Word = _.get(data, position.split(":"), {});

    // set word translation
    word.translation = translation[index];

    if (isPrefix(line)) {
      // set prefix
      const prefixes = word.prefixes ?? ([] as string[]);
      prefixes.push(getPrefix(line)!);
      word.prefixes = prefixes;
    } else if (isSuffix(line)) {
      // set suffix
      const suffixes = word.suffixes ?? [];
      suffixes.push({
        PGN: getSuffix(line, word, lineArray[lineIndex + 1])!,
        buckWalter: getBuckWalter(line),
      });
      word.suffixes = suffixes;
      //
      pronounData[lineSegments[1]] =
        position + "-" + getSuffix(line, word, lineArray[lineIndex + 1]);
    } else if (isFiil(line)) {
      // set part of speech
      word.aspect = getAspect(line);
      word.arPartOfSpeech = "fiʿil";
      word.mood = getMood(line) as "IND" | "SUBJ" | "JUS" | undefined;
      word.voice = getVoice(line);
      word.form = getForm(line);
      word.PGN = getPGN(line);
    } else if (isIsm(line)) {
      word.arPartOfSpeech = "ism";
      word.derivation = getDerivation(line);
      word.state = getState(line);
      word.grammaticalCase = getGrammaticalCase(line);
    } else {
      word.arPartOfSpeech = "ḥarf";
    }
    word.root = getRoot(line) ?? word.root;
    word.lemma = getLemma(line) ?? word.lemma;
    word.partOfSpeech = getPos(line) ?? word.partOfSpeech;
    word.position = position;
    prevPosition = position;
    _.setWith(data, position.split(":"), word, Object);
  });

// write data
fs.writeFile("data.json", JSON.stringify(data), function (err) {
  if (err) throw err;
  console.log("complete");
});
fs.writeFile("wordCount.json", JSON.stringify(wordCount), function (err) {
  if (err) throw err;
  console.log("complete");
});
pronounData;
fs.writeFile("pronounData.json", JSON.stringify(pronounData), function (err) {
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
function getPrefix(line: string) {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.includes("+")) {
      return segment;
    }
  }
  return null;
}

function getAspect(line: string): "PERF" | "IMPF" | "IMPV" | undefined {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.includes("PERF")) {
      return "PERF";
    }
    if (segment.includes("IMPF")) {
      return "IMPF";
    }
    if (segment.includes("IMPV")) {
      return "IMPV";
    }
  }
}

function getMood(line: string) {
  if (isFiil(line)) {
    if (getAspect(line) == "IMPF") {
      if (line.includes("MOOD:")) {
        for (const segment of line.split("MOOD:")) {
          if (["SUBJ", "JUS"].includes(segment)) {
            return segment;
          }
        }
      }
      return "IND";
    }
  }
  return null;
}
function getVoice(line: string) {
  if (line.includes("PASS")) {
    return "PASS";
  } else {
    return "ACT";
  }
}

function getForm(line: string) {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.match(/\([a-zA-Z]*\)/)) {
      return segment;
    }
  }
}

function getDerivation(
  line: string
): "ACT PCPL" | "PASS PCPL" | "VN" | undefined {
  if (line.includes("ACT|PCPL")) {
    return "ACT PCPL";
  }
  if (line.includes("PASS|PCPL")) {
    return "PASS PCPL";
  }
  if (line.includes("VN")) {
    return "VN";
  }
}
function getState(line: string): "DEF" | "INDEF" | undefined {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.includes("DEF")) {
      return "DEF";
    }
    if (segment.includes("INDEF")) {
      return "INDEF";
    }
  }
}
function getGrammaticalCase(line: string) {
  for (const segment of line.split(/[	 |]/)) {
    if (["NOM", "GEN", "ACC"].includes(segment)) {
      return segment;
    }
  }
}

function getSuffix(line: string, word: Word, nextLine: string) {
  for (const segment of line.split(/[	 |]/)) {
    if (segment.includes("+")) {
      return segment;
    } else if (segment.startsWith("PRON:")) {
      if (word.arPartOfSpeech === "ism") {
        return "POS-" + segment;
      }
      if (word.arPartOfSpeech === "ḥarf") {
        return "OBJ-" + segment;
      }
      for (const suffix of word.suffixes ?? []) {
        if (suffix.PGN.includes("PRON:")) {
          return "OBJ-" + segment;
        }
      }
      if (word.aspect == "PERF") {
        // 1S
        if (segment == "PRON:1S") {
          // -tu
          if (getBuckWalter(line) == "tu") {
            return "subj-" + segment;
          }
        }

        // 1P
        if (segment == "PRON:1P") {
          // -naA
          if (getBuckWalter(line) == "naA") {
            return "subj-" + segment;
          }
        }

        // 2MS
        if (segment == "PRON:2MS") {
          // -ta
          if (getBuckWalter(line) == "ta") {
            return "subj-" + segment;
          }
        }

        // 2FS
        if (segment == "PRON:2FS") {
          // -ti
          if (getBuckWalter(line) == "ti") {
            return "subj-" + segment;
          }
        }

        // 2D
        if (segment == "PRON:2D") {
          // -tumaA
          if (getBuckWalter(line) == "tumaA") {
            return "subj-" + segment;
          }
        }

        // 2MP
        if (segment == "PRON:2MP") {
          const lineSegments = nextLine.split("	");
          const position = lineSegments[0].substring(
            1,
            lineSegments[0].length - 3
          );
          if (
            position == word.position &&
            nextLine.match(/.*PRON:.*/)?.length
          ) {
            // -tumuw
            if (getBuckWalter(line) == "tumuw") {
              return "subj-" + segment;
            }
          } else {
            // -tum
            if (getBuckWalter(line) == "tum") {
              return "subj-" + segment;
            }
          }
        }

        // 2FP
        if (segment == "PRON:2FP") {
          // -tunna
          if (getBuckWalter(line) == "tunna") {
            return "subj-" + segment;
          }
        }

        // 3MD
        if (segment == "PRON:3MD") {
          // -A
          if (getBuckWalter(line) == "A") {
            return "subj-" + segment;
          }
        }

        // 3FD
        if (segment == "PRON:3FD") {
          // -taA
          if (getBuckWalter(line) == "taA") {
            return "subj-" + segment;
          }
        }

        // 3MP
        if (segment == "PRON:3MP") {
          // -wA
          if (["wA", "w"].includes(getBuckWalter(line))) {
            return "subj-" + segment;
          }
        }

        // 3FP
        if (segment == "PRON:3FP") {
          // -na
          if (getBuckWalter(line) == "na") {
            return "subj-" + segment;
          }
        }
      }
      if (word.aspect === "IMPF") {
        // 2D, 3D
        if (["PRON:2D", "PRON:3D"].includes(segment)) {
          // -A
          if (["A", "An"].includes(getBuckWalter(line))) {
            return "subj-" + segment;
          }
        }

        // 2MP, 3MP
        if (["PRON:2MP", "PRON:3MP"].includes(segment)) {
          // MOOD:IND
          if (word.mood == "IND") {
            // -wna
            if (["wna", "w,na", "w"].includes(getBuckWalter(line))) {
              return "subj-" + segment;
            }
          } // MOOD:JUS

          if (word.mood == "JUS") {
            if (["wna", "wA@", "w,A@", "w"].includes(getBuckWalter(line))) {
              return "subj-" + segment;
            }
          }
          // MOOD:SUBJ
          if ((word.mood = "SUBJ")) {
            // -wA@
            if (["wA", "w,A@", "w"].includes(getBuckWalter(line))) {
              return "subj-" + segment;
            }
          }
        }

        // 3FP
        if (segment == "PRON:3FP") {
          // -na
          if (getBuckWalter(line) == "na") {
            return "subj-" + segment;
          }
        }

        // 2FP
        if (segment == "PRON:2FP") {
          // -na
          if (getBuckWalter(line) == "na") {
            return "subj-" + segment;
          }
        }
      }
      if ((word.aspect = "IMPV")) {
        // 2D
        if (segment == "PRON:2D") {
          // -A
          if (getBuckWalter(line) == "A") {
            return "subj-" + segment;
          }
        }

        // 2FS
        if (segment == "PRON:2FS") {
          // -Y
          if (getBuckWalter(line) == "Y") {
            return "subj-" + segment;
          }
        }

        // 2MP
        if (segment == "PRON:2MP") {
          // -wA@
          if (
            ["wA@", "w", ",^A@", "'uw", "halum~a"].includes(getBuckWalter(line))
          ) {
            return "subj-" + segment;
          }
        }

        // 2FP
        if (segment == "2FP") {
          // -na
          if (getBuckWalter(line) == "na") {
            return "subj-" + segment;
          }
        }
      }
      return "OBJ-" + segment;
    }
  }
  return null;
}
function getBuckWalter(line: string): string {
  return line.split(/[	|]/)[1];
}
function getPGN(line: string): string | undefined {
  for (const segment of line.split(/[|]/)) {
    if (!segment.startsWith("(") && segment.match(/\d+\w+/)) {
      return segment;
    }
  }
}
