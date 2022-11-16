"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvFileParser = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_1 = require("csv");
/**
 * Parses a CSV file with headers:
 * hash
 */
class CsvFileParser {
    parseFile(filePath) {
        return fs_1.default
            .createReadStream(filePath)
            .pipe((0, csv_1.parse)({ delimiter: ",", from_line: 2 }))
            .pipe((0, csv_1.transform)(([hash]) => {
            try {
                return { hash };
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error(`Failed to parse file: ${e.message}`);
                }
                else {
                    throw e;
                }
            }
        }));
    }
}
exports.CsvFileParser = CsvFileParser;
