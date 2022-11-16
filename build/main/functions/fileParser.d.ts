import { Token } from "@uniswap/sdk-core";
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
export declare class CsvFileParser {
    parseFile(filePath: string): AsyncIterable<{
        hash: string;
    }>;
}
//# sourceMappingURL=fileParser.d.ts.map