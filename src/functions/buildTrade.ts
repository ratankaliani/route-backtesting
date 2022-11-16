import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import _ from "lodash";

import {
  ExactInAmounts,
  ExactOutAmounts,
  ExtractedRoute,
  ExtractedTrade,
} from "../schema";

export function buildTrade(
  routes: ExtractedRoute[],
  hash: string,
  data: string
): ExtractedTrade {
  const tokenIn = routes[0]!.tokenIn;
  const tokenOut = routes[0]!.tokenOut;
  const tokenInAddress = routes[0]!.tokenPathAddresses[0];
  const tokenOutAddress =
    routes[0]!.tokenPathAddresses[routes[0]!.tokenPathAddresses.length - 1];

  const tokenInSymbol = routes[0]!.tokenPathSymbols[0];
  const tokenOutSymbol =
    routes[0]!.tokenPathSymbols[routes[0]!.tokenPathSymbols.length - 1];

  if (routes[0]!.type == "EXACT_IN") {
    // Compute percentages for each route
    const totalAmountIn = _(routes as ExactInAmounts[])
      .map((r) => BigNumber.from(r.amountIn))
      .reduce((acc, cur) => acc.add(cur), BigNumber.from(0))
      .toString();

    const totalAmountInDecimal = CurrencyAmount.fromRawAmount(
      tokenIn,
      totalAmountIn
    ).toExact();

    const totalAmountOutMinimum = _(routes as ExactInAmounts[])
      .map((r) => BigNumber.from(r.amountOutMinimum))
      .reduce((acc, cur) => acc.add(cur), BigNumber.from(0))
      .toString();

    const totalAmountOutMinimumDecimal = CurrencyAmount.fromRawAmount(
      tokenOut,
      totalAmountOutMinimum
    ).toExact();

    const routesWithPercentage = _(routes)
      .map((r) => {
        const { amountIn } = r as ExactInAmounts;
        const percentage = new Fraction(amountIn)
          .divide(new Fraction(totalAmountIn))
          .multiply(new Fraction(100))
          .toFixed(2);
        return { ...r, percentage };
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
      tokenIn: routes[0]!.tokenIn,
      tokenOut: routes[0]!.tokenOut,
    };
  } else {
    // Compute percentages for each route
    const totalAmountOut = _(routes as ExactOutAmounts[])
      .map((r) => BigNumber.from(r.amountOut))
      .reduce((acc, cur) => acc.add(cur), BigNumber.from(0))
      .toString();

    const totalAmountOutDecimal = CurrencyAmount.fromRawAmount(
      tokenOut,
      totalAmountOut
    ).toExact();

    const totalAmountInMaximum = _(routes as ExactOutAmounts[])
      .map((r) => BigNumber.from(r.amountInMaximum))
      .reduce((acc, cur) => acc.add(cur), BigNumber.from(0))
      .toString();

    const totalAmountInMaximumDecimal = CurrencyAmount.fromRawAmount(
      tokenIn,
      totalAmountInMaximum
    ).toExact();

    const routesWithPercentage = _(routes)
      .map((r) => {
        const { amountOut } = r as ExactOutAmounts;
        const percentage = new Fraction(amountOut)
          .divide(new Fraction(totalAmountOut))
          .multiply(new Fraction(100))
          .toFixed(2);
        return { ...r, percentage };
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
      tokenIn: routes[0]!.tokenIn,
      tokenOut: routes[0]!.tokenOut,
    };
  }
}
