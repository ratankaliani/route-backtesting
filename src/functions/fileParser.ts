import fs from "fs";

import { Token } from "@uniswap/sdk-core";
import { parse, transform } from "csv";

export interface TokenParser {
  /**
   * Parse a file, returning an array of token definitions
   */
  parseFile(filePath: string): AsyncIterable<Token>;
}

/**
 * Parses a CSV file with headers:
 * hash
 */
export class CsvFileParser {
  parseFile(filePath: string): AsyncIterable<{ hash: string }> {
    return fs
      .createReadStream(filePath)
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .pipe(
        transform(([hash]) => {
          try {
            return { hash };
          } catch (e) {
            if (e instanceof Error) {
              console.error(`Failed to parse file: ${e.message}`);
            } else {
              throw e;
            }
          }
        })
      );
  }
}
