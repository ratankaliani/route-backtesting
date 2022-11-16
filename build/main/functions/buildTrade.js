"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTrade = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const sdk_core_1 = require("@uniswap/sdk-core");
const lodash_1 = __importDefault(require("lodash"));
function buildTrade(routes, hash, data) {
    const tokenIn = routes[0].tokenIn;
    const tokenOut = routes[0].tokenOut;
    const tokenInAddress = routes[0].tokenPathAddresses[0];
    const tokenOutAddress = routes[0].tokenPathAddresses[routes[0].tokenPathAddresses.length - 1];
    const tokenInSymbol = routes[0].tokenPathSymbols[0];
    const tokenOutSymbol = routes[0].tokenPathSymbols[routes[0].tokenPathSymbols.length - 1];
    if (routes[0].type == "EXACT_IN") {
        // Compute percentages for each route
        const totalAmountIn = (0, lodash_1.default)(routes)
            .map((r) => bignumber_1.BigNumber.from(r.amountIn))
            .reduce((acc, cur) => acc.add(cur), bignumber_1.BigNumber.from(0))
            .toString();
        const totalAmountInDecimal = sdk_core_1.CurrencyAmount.fromRawAmount(tokenIn, totalAmountIn).toExact();
        const totalAmountOutMinimum = (0, lodash_1.default)(routes)
            .map((r) => bignumber_1.BigNumber.from(r.amountOutMinimum))
            .reduce((acc, cur) => acc.add(cur), bignumber_1.BigNumber.from(0))
            .toString();
        const totalAmountOutMinimumDecimal = sdk_core_1.CurrencyAmount.fromRawAmount(tokenOut, totalAmountOutMinimum).toExact();
        const routesWithPercentage = (0, lodash_1.default)(routes)
            .map((r) => {
            const { amountIn } = r;
            const percentage = new sdk_core_1.Fraction(amountIn)
                .divide(new sdk_core_1.Fraction(totalAmountIn))
                .multiply(new sdk_core_1.Fraction(100))
                .toFixed(2);
            return Object.assign(Object.assign({}, r), { percentage });
        })
            .value();
        return {
            hash,
            data,
            totalAmountIn,
            totalAmountInDecimal,
            totalAmountOutMinimum,
            totalAmountOutMinimumDecimal,
            tokenInAddress,
            tokenOutAddress,
            tokenInSymbol,
            tokenOutSymbol,
            routes: routesWithPercentage,
            tokenIn: routes[0].tokenIn,
            tokenOut: routes[0].tokenOut,
        };
    }
    else {
        // Compute percentages for each route
        const totalAmountOut = (0, lodash_1.default)(routes)
            .map((r) => bignumber_1.BigNumber.from(r.amountOut))
            .reduce((acc, cur) => acc.add(cur), bignumber_1.BigNumber.from(0))
            .toString();
        const totalAmountOutDecimal = sdk_core_1.CurrencyAmount.fromRawAmount(tokenOut, totalAmountOut).toExact();
        const totalAmountInMaximum = (0, lodash_1.default)(routes)
            .map((r) => bignumber_1.BigNumber.from(r.amountInMaximum))
            .reduce((acc, cur) => acc.add(cur), bignumber_1.BigNumber.from(0))
            .toString();
        const totalAmountInMaximumDecimal = sdk_core_1.CurrencyAmount.fromRawAmount(tokenIn, totalAmountInMaximum).toExact();
        const routesWithPercentage = (0, lodash_1.default)(routes)
            .map((r) => {
            const { amountOut } = r;
            const percentage = new sdk_core_1.Fraction(amountOut)
                .divide(new sdk_core_1.Fraction(totalAmountOut))
                .multiply(new sdk_core_1.Fraction(100))
                .toFixed(2);
            return Object.assign(Object.assign({}, r), { percentage });
        })
            .value();
        return {
            hash,
            data,
            totalAmountOut,
            totalAmountOutDecimal,
            totalAmountInMaximum,
            totalAmountInMaximumDecimal,
            tokenInAddress,
            tokenOutAddress,
            tokenInSymbol,
            tokenOutSymbol,
            routes: routesWithPercentage,
            tokenIn: routes[0].tokenIn,
            tokenOut: routes[0].tokenOut,
        };
    }
}
exports.buildTrade = buildTrade;
