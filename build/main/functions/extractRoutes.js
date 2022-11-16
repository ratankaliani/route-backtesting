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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRoutes = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const solidity_1 = require("@ethersproject/solidity");
const parseV2Path_1 = require("./parseV2Path");
const parseV3Path_1 = require("./parseV3Path");
function extractRoutes(multicall, swapRouter02, tokenProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        const routes = [];
        for (const data of multicall.args.data) {
            const swap = swapRouter02.parseTransaction({ data });
            switch (swap.name) {
                case "swapExactTokensForTokens": {
                    const { routeReadable, tokenPathAddresses, tokenPathSymbols, poolPathAddresses, poolPathSymbols, tokenIn, tokenOut, } = yield (0, parseV2Path_1.parseV2Path)(tokenProvider, swap.args.path);
                    const amountIn = swap.args.amountIn.toString();
                    const amountOutMinimum = swap.args.amountOutMin.toString();
                    const extractedRoute = {
                        amountIn,
                        routeReadable,
                        poolPathSymbols,
                        tokenPathSymbols,
                        tokenPathAddresses,
                        poolPathAddresses,
                        amountOutMinimum,
                        protocol: "V2",
                        type: "EXACT_IN",
                        tokenIn,
                        tokenOut,
                    };
                    routes.push(extractedRoute);
                    break;
                }
                case "swapTokensForExactTokens": {
                    const { routeReadable, tokenPathAddresses, tokenPathSymbols, poolPathAddresses, poolPathSymbols, tokenIn, tokenOut, } = yield (0, parseV2Path_1.parseV2Path)(tokenProvider, swap.args.path);
                    const amountOut = swap.args.amountOut.toString();
                    const amountInMaximum = swap.args.amountInMax.toString();
                    const extractedRoute = {
                        amountOut,
                        routeReadable,
                        poolPathSymbols,
                        tokenPathSymbols,
                        tokenPathAddresses,
                        poolPathAddresses,
                        amountInMaximum,
                        protocol: "V2",
                        type: "EXACT_OUT",
                        tokenIn,
                        tokenOut,
                    };
                    routes.push(extractedRoute);
                    break;
                }
                case "exactInput": {
                    const { routeReadable, tokenPathAddresses, tokenPathSymbols, poolPathFees, poolPathAddresses, poolPathSymbols, tokenIn, tokenOut, } = yield (0, parseV3Path_1.parseV3Path)(tokenProvider, swap.args.params.path);
                    const amountIn = swap.args.params.amountIn.toString();
                    const amountOutMinimum = swap.args.params.amountOutMinimum.toString();
                    const extractedRoute = {
                        amountIn,
                        routeReadable,
                        poolPathSymbols,
                        tokenPathSymbols,
                        tokenPathAddresses,
                        poolPathAddresses,
                        amountOutMinimum,
                        protocol: "V3",
                        poolPathFees,
                        type: "EXACT_IN",
                        tokenIn,
                        tokenOut,
                    };
                    routes.push(extractedRoute);
                    break;
                }
                case "exactInputSingle": {
                    const path = (0, solidity_1.pack)(["address", "uint24", "address"], [
                        swap.args.params.tokenIn,
                        bignumber_1.BigNumber.from(swap.args.params.fee),
                        swap.args.params.tokenOut,
                    ]);
                    const { routeReadable, tokenPathAddresses, tokenPathSymbols, poolPathFees, poolPathAddresses, poolPathSymbols, tokenIn, tokenOut, } = yield (0, parseV3Path_1.parseV3Path)(tokenProvider, path);
                    const amountIn = swap.args.params.amountIn.toString();
                    const amountOutMinimum = swap.args.params.amountOutMinimum.toString();
                    const extractedRoute = {
                        amountIn,
                        routeReadable,
                        poolPathSymbols,
                        tokenPathSymbols,
                        tokenPathAddresses,
                        poolPathAddresses,
                        amountOutMinimum,
                        protocol: "V3",
                        poolPathFees,
                        type: "EXACT_IN",
                        tokenIn,
                        tokenOut,
                    };
                    routes.push(extractedRoute);
                    break;
                }
                case "exactOutput": {
                    const { routeReadable, tokenPathAddresses, tokenPathSymbols, poolPathFees, poolPathAddresses, poolPathSymbols, tokenIn, tokenOut, } = yield (0, parseV3Path_1.parseV3Path)(tokenProvider, swap.args.params.path, false);
                    const amountOut = swap.args.params.amountOut.toString();
                    const amountInMaximum = swap.args.params.amountInMaximum.toString();
                    const extractedRoute = {
                        amountOut,
                        routeReadable,
                        poolPathSymbols,
                        tokenPathSymbols,
                        tokenPathAddresses,
                        poolPathAddresses,
                        amountInMaximum,
                        protocol: "V3",
                        poolPathFees,
                        type: "EXACT_OUT",
                        tokenIn,
                        tokenOut,
                    };
                    routes.push(extractedRoute);
                    break;
                }
                case "exactOutputSingle": {
                    const path = (0, solidity_1.pack)(["address", "uint24", "address"], [
                        swap.args.params.tokenIn,
                        bignumber_1.BigNumber.from(swap.args.params.fee),
                        swap.args.params.tokenOut,
                    ]);
                    const { routeReadable, tokenPathAddresses, tokenPathSymbols, poolPathFees, poolPathAddresses, poolPathSymbols, tokenIn, tokenOut, } = yield (0, parseV3Path_1.parseV3Path)(tokenProvider, path);
                    const amountOut = swap.args.params.amountOut.toString();
                    const amountInMaximum = swap.args.params.amountInMaximum.toString();
                    const extractedRoute = {
                        amountOut,
                        routeReadable,
                        poolPathSymbols,
                        tokenPathSymbols,
                        tokenPathAddresses,
                        poolPathAddresses,
                        amountInMaximum,
                        protocol: "V3",
                        poolPathFees,
                        type: "EXACT_OUT",
                        tokenIn,
                        tokenOut,
                    };
                    routes.push(extractedRoute);
                    break;
                }
                default:
                    continue;
            }
        }
        return routes;
    });
}
exports.extractRoutes = extractRoutes;
