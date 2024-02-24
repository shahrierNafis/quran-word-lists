export type WordCount = {
  [key: string]: {
    [key: string]: string;
  };
};
export type Word = {
  translation: string;
  root: string | null;
  lemma: string | null;
  arPartOfSpeech: "ḥarf" | "fiʿil" | "ism" | null;
  partOfSpeech: string | null;
  position: string;
  prefixes: string[];
  suffixes: string[];
};
