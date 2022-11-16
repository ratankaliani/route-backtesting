import { CurrencyAmount } from "@uniswap/sdk-core";
import { ITokenProvider, poolToString } from "@uniswap/smart-order-router";
import { Pair } from "@uniswap/v2-sdk";
import { Pool } from "@uniswap/v3-sdk";
import _ from "lodash";

import { V2RouteInfo } from "../schema";

export async function parseV2Path(
  tokenProvider: ITokenProvider,
  path: string[]
): Promise<V2RouteInfo> {
  const tokenPathAddresses = path;
  const tokenPathAccessor = await tokenProvider.getTokens(tokenPathAddresses);
  const tokenPath = _(tokenPathAddresses)
    .map((t) => tokenPathAccessor.getTokenByAddress(t))
    .compact()
    .value();
  const poolPath: Pair[] = [];
  const poolPathAddresses: string[] = [];
  for (let i = 0; i < tokenPathAddresses.length - 1; i++) {
    const tokenA = tokenPath[i];
    const tokenB = tokenPath[i + 1];

    poolPathAddresses.push(Pair.getAddress(tokenA, tokenB));
    poolPath.push(
      new Pair(
        CurrencyAmount.fromFractionalAmount(tokenA, 1, 1),
        CurrencyAmount.fromFractionalAmount(tokenB, 1, 1)
      )
    );
  }

  const poolPathSymbols = _.map(poolPath, poolToString);

  const tokenPathSymbols = _.map(tokenPath, (token) => `${token.symbol}`);
  const poolFeePath = _.map(
    poolPath,
    (pool) =>
      `${
        pool instanceof Pool
          ? ` -- ${pool.fee / 10000}% [${Pool.getAddress(
              pool.token0,
              pool.token1,
              pool.fee
            )}]`
          : ` -- [${Pair.getAddress(
              (pool as Pair).token0,
              (pool as Pair).token1
            )}]`
      } --> `
  );

  const routeStr: string[] = ["[V2]: "];
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
}
