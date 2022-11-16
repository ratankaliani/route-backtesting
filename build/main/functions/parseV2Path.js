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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseV2Path = void 0;
const sdk_core_1 = require("@uniswap/sdk-core");
const smart_order_router_1 = require("@uniswap/smart-order-router");
const v2_sdk_1 = require("@uniswap/v2-sdk");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const lodash_1 = __importDefault(require("lodash"));
function parseV2Path(tokenProvider, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenPathAddresses = path;
        const tokenPathAccessor = yield tokenProvider.getTokens(tokenPathAddresses);
        const tokenPath = (0, lodash_1.default)(tokenPathAddresses)
            .map((t) => tokenPathAccessor.getTokenByAddress(t))
            .compact()
            .value();
        const poolPath = [];
        const poolPathAddresses = [];
        for (let i = 0; i < tokenPathAddresses.length - 1; i++) {
            const tokenA = tokenPath[i];
            const tokenB = tokenPath[i + 1];
            poolPathAddresses.push(v2_sdk_1.Pair.getAddress(tokenA, tokenB));
            poolPath.push(new v2_sdk_1.Pair(sdk_core_1.CurrencyAmount.fromFractionalAmount(tokenA, 1, 1), sdk_core_1.CurrencyAmount.fromFractionalAmount(tokenB, 1, 1)));
        }
        const poolPathSymbols = lodash_1.default.map(poolPath, smart_order_router_1.poolToString);
        const tokenPathSymbols = lodash_1.default.map(tokenPath, (token) => `${token.symbol}`);
        const poolFeePath = lodash_1.default.map(poolPath, (pool) => `${pool instanceof v3_sdk_1.Pool
            ? ` -- ${pool.fee / 10000}% [${v3_sdk_1.Pool.getAddress(pool.token0, pool.token1, pool.fee)}]`
            : ` -- [${v2_sdk_1.Pair.getAddress(pool.token0, pool.token1)}]`} --> `);
        const routeStr = ["[V2]: "];
        for (let i = 0; i < tokenPathSymbols.length; i++) {
            routeStr.push(tokenPathSymbols[i]);
            if (i < poolFeePath.length) {
                routeStr.push(poolFeePath[i]);
            }
        }
        const routeReadable = routeStr.join("");
        return {
            routeReadable,
            tokenPathAddresses,
            tokenPathSymbols,
            poolPathAddresses,
            poolPathSymbols,
            tokenIn: tokenPath[0],
            tokenOut: tokenPath[tokenPath.length - 1],
        };
    });
}
exports.parseV2Path = parseV2Path;
