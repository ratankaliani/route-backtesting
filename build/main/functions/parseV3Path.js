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
exports.parseV3Path = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const smart_order_router_1 = require("@uniswap/smart-order-router");
const v2_sdk_1 = require("@uniswap/v2-sdk");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const lodash_1 = __importDefault(require("lodash"));
function parseV3Path(tokenProvider, _path, exactIn = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let tokenPathAddresses = [];
        let poolPathFees = [];
        let path = _path.slice(2);
        while (path.length >= 86) {
            const poolHex = path.slice(0, 86);
            const tokenIn = "0x" + poolHex.slice(0, 40);
            const fee = "0x" + poolHex.slice(40, 46);
            const tokenOut = "0x" + poolHex.slice(46);
            // only on first
            if (path.length == _path.length - 2) {
                tokenPathAddresses.push(tokenIn);
            }
            poolPathFees.push(bignumber_1.BigNumber.from(fee).toString());
            tokenPathAddresses.push(tokenOut);
            path = path.slice(46);
        }
        // path comes reversed for v3 exactout, flip it back
        if (!exactIn) {
            tokenPathAddresses = tokenPathAddresses.reverse();
            poolPathFees = poolPathFees.reverse();
        }
        const tokenPathAccessor = yield tokenProvider.getTokens(tokenPathAddresses);
        const tokenPath = (0, lodash_1.default)(tokenPathAddresses)
            .map((t) => tokenPathAccessor.getTokenByAddress(t))
            .compact()
            .value();
        const tokenPathSymbols = lodash_1.default.map(tokenPath, (token) => `${token.symbol}`);
        const poolPath = [];
        const poolPathAddresses = [];
        for (let i = 0; i < tokenPathAddresses.length - 1; i++) {
            const tokenA = tokenPath[i];
            const tokenB = tokenPath[i + 1];
            poolPathAddresses.push(v2_sdk_1.Pair.getAddress(tokenA, tokenB));
            poolPath.push(new v3_sdk_1.Pool(tokenA, tokenB, (0, smart_order_router_1.parseFeeAmount)(poolPathFees[i]), (0, v3_sdk_1.encodeSqrtRatioX96)(1, 1), 0, 0));
        }
        const poolPathSymbols = lodash_1.default.map(poolPath, smart_order_router_1.poolToString);
        const poolFeePath = lodash_1.default.map(poolPath, (pool) => ` -- ${pool.fee / 10000}% [${v3_sdk_1.Pool.getAddress(pool.token0, pool.token1, pool.fee)}] --> `);
        const routeStr = ["[V3]: "];
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
            poolPathFees,
            poolPathAddresses,
            poolPathSymbols,
            tokenIn: tokenPath[0],
            tokenOut: tokenPath[tokenPath.length - 1],
        };
    });
}
exports.parseV3Path = parseV3Path;
