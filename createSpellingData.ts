import fs from "fs";
import _ from "lodash";
import { WordCount, SpellingData } from "./types";
import path from "path";

(async () => {
  const wordCount: WordCount = require("./wordCount.json");
  const data: SpellingData = {};

  for (const surah in wordCount) {
    for (const verse in (wordCount as WordCount)[surah]) {
      console.log(`${surah}:${verse}`);
      async function fetcher(surah: string, verse: string) {
        try {
          const json = (await (
            await fetch(
              `https://api.quran.com/api/v4/verses/by_key/${surah}:${verse}?words=true&word_fields=text_imlaei`
            )
          ).json()) as any;

          const newData = data[surah] ?? {};
          newData[verse] = json.verse.words;
          data[surah] = newData;
        } catch (error) {
          await fetcher(surah, verse);
        }
      }
      await fetcher(surah, verse);
    }
    try {
      // write data
      fs.writeFileSync(
        path.join(__dirname, "spellingData.json"),
        JSON.stringify(data)
      );
    } catch (error) {
      console.log(error);
    }
  }
})();
