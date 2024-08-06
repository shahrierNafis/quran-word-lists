export type WordCount = {
  [key: string]: {
    [key: string]: string;
  };
};
export type Word = {
  translation?: string;
  root?: string;
  lemma?: string;
  arPartOfSpeech?: "ḥarf" | "fiʿil" | "ism";
  partOfSpeech?: string | null;
  position: string;
  prefixes?: string[];
  suffixes?: { buckWalter: string; PGN: string }[];
  aspect?: "PERF" | "IMPF" | "IMPV";
  mood?: "IND" | "SUBJ" | "JUS";
  voice?: "ACT" | "PASS";
  form?: string;
  derivation?: "ACT PCPL" | "PASS PCPL" | "VN";
  state?: "DEF" | "INDEF";
  grammaticalCase?: string;
  PGN?: string;
};
export type SpellingData = {
  [key: string]: {
    [key: string]: {
      char_type_name: string;
      text_imlaei: string;
      text: string;
      transliteration: {
        text: string;
      };
    }[];
  };
};

export type List = {
  [key: string]: {
    positions: string[];
    description: string;
    name: string;
  };
};
