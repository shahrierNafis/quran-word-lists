import { Word } from "../types";
type Data = {
  [key: string]: {
    [key: string]: {
      [key: string]: Word;
    };
  };
};

const data: Data = require("../data.json");

export default function doesNotHaveSameLemma(
  options: string[],
  wordData: Word
) {
  for (const position of options) {
    const [chapter, verse, kalaam] = position.split(":");
    if (data[chapter][verse][kalaam].lemma == wordData.lemma) {
      return false;
    }
  }
  return true;
}
