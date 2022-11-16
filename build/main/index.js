#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRoute = exports.CHAIN = void 0;
const fs_1 = __importDefault(require("fs"));
const smart_order_router_1 = require("@uniswap/smart-order-router");
const fsPromises = fs_1.default.promises;
const lodash_1 = __importDefault(require("lodash"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const buildTokenProvider_1 = require("./functions/buildTokenProvider");
const buildTrade_1 = require("./functions/buildTrade");
const extractRoutes_1 = require("./functions/extractRoutes");
const fileParser_1 = require("./functions/fileParser");
const SwapRouter02__factory_1 = require("./types/other/factories/SwapRouter02__factory");
exports.CHAIN = smart_order_router_1.ChainId.MAINNET;
/**
 * Takes a csv containing transaction calldata on SwapRouter02 and extracts the routes from them.
 *
 * Generates a JSON file containing each pools/tokens for each route in the swap and amounts/percentages for each route.
 *
 * During development can use via:
 *  yarn start extract-route ./test_extract_routes.csv "https://mainnet.infura.io/v3/<my_key>" ./output'
 *  yarn start extract-route <some_transaction_hash> "https://mainnet.infura.io/v3/<my_key>"
 */
function extractRoute(fileOrTxHash, rpcUrl, outFile) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let transactions;
        let provider;
        let tokenProvider;
        if (outFile) {
            ({ tokenProvider, provider } = yield (0, buildTokenProvider_1.buildProviders)(rpcUrl));
            transactions = [{ hash: fileOrTxHash }];
        }
        else {
            ({ tokenProvider, provider } = yield (0, buildTokenProvider_1.buildProviders)(rpcUrl));
            transactions = new fileParser_1.CsvFileParser().parseFile(fileOrTxHash);
        }
        const trades = [];
        try {
            for (var transactions_1 = __asyncValues(transactions), transactions_1_1; transactions_1_1 = yield transactions_1.next(), !transactions_1_1.done;) {
                const { hash } = transactions_1_1.value;
                let data;
                try {
                    ({ data } = yield provider.getTransaction(hash));
                    const swapRouter02 = SwapRouter02__factory_1.SwapRouter02__factory.createInterface();
                    // Must be a multicall if it came from our interface, assume so. Will error out later if not.
                    const multicall = swapRouter02.parseTransaction({ data });
                    // Get the routes from the call
                    const routes = yield (0, extractRoutes_1.extractRoutes)(multicall, swapRouter02, tokenProvider);
                    // Check for weirdness. No guarantee every swap on the swap router came from our interface
                    // Check all routes are exact in or out
                    (0, tiny_invariant_1.default)(routes.every((r) => r.type == routes[0].type));
                    // Check all routes start and end with same token. Just a way to filter out interleaving for now
                    (0, tiny_invariant_1.default)(routes.every((r) => r.tokenPathAddresses[0] == routes[0].tokenPathAddresses[0]));
                    (0, tiny_invariant_1.default)(routes.every((r) => r.tokenPathAddresses[r.tokenPathAddresses.length - 1] ==
                        routes[0].tokenPathAddresses[routes[0].tokenPathAddresses.length - 1]));
                    // Compute the final object we write to the output file, including calculating percentages of each route
                    const trade = (0, buildTrade_1.buildTrade)(routes, hash, data);
                    trades.push(trade);
                    console.log(`Successfully processed transaction${hash ? "with hash" : ""}` +
                        hash +
                        ". Processed " +
                        trades.length +
                        " transactions.");
                }
                catch (err) {
                    // Could fail for many different reasons, just catch them all and write the error to the output file
                    const fail = {
                        hash,
                        data: data !== null && data !== void 0 ? data : "Could not get data",
                        errorReason: JSON.stringify(err),
                    };
                    trades.push(fail);
                    console.log("Failed to process transaction with hash " +
                        hash +
                        ". Processed " +
                        trades.length +
                        " transactions.");
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (transactions_1_1 && !transactions_1_1.done && (_a = transactions_1.return)) yield _a.call(transactions_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (outFile) {
            // Better chunk since files can be huge
            const i = 1;
            for (const tradeChunk of lodash_1.default.chunk(trades, 250)) {
                const file = `${outFile}_${i}.json`;
                yield fsPromises.writeFile(file, JSON.stringify(tradeChunk, null, 2));
                console.log(`Outputted results to ${file}`);
            }
        }
        else {
            console.log(JSON.stringify(trades[0], null, 2));
        }
    });
}
exports.extractRoute = extractRoute;
