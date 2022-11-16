import { BigNumber } from "@ethersproject/bignumber";
import { pack } from "@ethersproject/solidity";
import {
  CachingTokenProviderWithFallback,
  ITokenProvider,
} from "@uniswap/smart-order-router";
import { TransactionDescription } from "ethers/lib/utils";

import {
  ExtractedRoute,
  V2ExactIn,
  V2ExactOut,
  V3ExactIn,
  V3ExactOut,
} from "../schema";
import { SwapRouter02Interface } from "../types/other/SwapRouter02";

import { parseV2Path } from "./parseV2Path";
import { parseV3Path } from "./parseV3Path";

export async function extractRoutes(
  multicall: TransactionDescription,
  swapRouter02: SwapRouter02Interface,
  tokenProvider: ITokenProvider
) {
  const routes: ExtractedRoute[] = [];

  for (const data of multicall.args.data) {
    const swap = swapRouter02.parseTransaction({ data });

    switch (swap.name) {
      case "swapExactTokensForTokens": {
        const {
          routeReadable,
          tokenPathAddresses,
          tokenPathSymbols,
          poolPathAddresses,
          poolPathSymbols,
          tokenIn,
          tokenOut,
        } = await parseV2Path(tokenProvider, swap.args.path);

        const amountIn = (swap.args.amountIn as BigNumber).toString();
        const amountOutMinimum = (
          swap.args.amountOutMin as BigNumber
        ).toString();

        const extractedRoute: V2ExactIn = {
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
        const {
          routeReadable,
          tokenPathAddresses,
          tokenPathSymbols,
          poolPathAddresses,
          poolPathSymbols,
          tokenIn,
          tokenOut,
        } = await parseV2Path(tokenProvider, swap.args.path);

        const amountOut = (swap.args.amountOut as BigNumber).toString();
        const amountInMaximum = (swap.args.amountInMax as BigNumber).toString();

        const extractedRoute: V2ExactOut = {
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
        const {
          routeReadable,
          tokenPathAddresses,
          tokenPathSymbols,
          poolPathFees,
          poolPathAddresses,
          poolPathSymbols,
          tokenIn,
          tokenOut,
        } = await parseV3Path(tokenProvider, swap.args.params.path);

        const amountIn = (swap.args.params.amountIn as BigNumber).toString();
        const amountOutMinimum = (
          swap.args.params.amountOutMinimum as BigNumber
        ).toString();

        const extractedRoute: V3ExactIn = {
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
        const path = pack(
          ["address", "uint24", "address"],
          [
            swap.args.params.tokenIn,
            BigNumber.from(swap.args.params.fee),
            swap.args.params.tokenOut,
          ]
        );

        const {
          routeReadable,
          tokenPathAddresses,
          tokenPathSymbols,
          poolPathFees,
          poolPathAddresses,
          poolPathSymbols,
          tokenIn,
          tokenOut,
        } = await parseV3Path(tokenProvider, path);

        const amountIn = (swap.args.params.amountIn as BigNumber).toString();
        const amountOutMinimum = (
          swap.args.params.amountOutMinimum as BigNumber
        ).toString();

        const extractedRoute: V3ExactIn = {
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
        const {
          routeReadable,
          tokenPathAddresses,
          tokenPathSymbols,
          poolPathFees,
          poolPathAddresses,
          poolPathSymbols,
          tokenIn,
          tokenOut,
        } = await parseV3Path(tokenProvider, swap.args.params.path, false);

        const amountOut = (swap.args.params.amountOut as BigNumber).toString();
        const amountInMaximum = (
          swap.args.params.amountInMaximum as BigNumber
        ).toString();

        const extractedRoute: V3ExactOut = {
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
        const path = pack(
          ["address", "uint24", "address"],
          [
            swap.args.params.tokenIn,
            BigNumber.from(swap.args.params.fee),
            swap.args.params.tokenOut,
          ]
        );

        const {
          routeReadable,
          tokenPathAddresses,
          tokenPathSymbols,
          poolPathFees,
          poolPathAddresses,
          poolPathSymbols,
          tokenIn,
          tokenOut,
        } = await parseV3Path(tokenProvider, path);

        const amountOut = (swap.args.params.amountOut as BigNumber).toString();
        const amountInMaximum = (
          swap.args.params.amountInMaximum as BigNumber
        ).toString();

        const extractedRoute: V3ExactOut = {
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
}
