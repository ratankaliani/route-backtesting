import { BigNumber } from "@ethersproject/bignumber";
import {
  ITokenProvider,
  parseFeeAmount,
  poolToString,
} from "@uniswap/smart-order-router";
import { Pair } from "@uniswap/v2-sdk";
import { encodeSqrtRatioX96, Pool } from "@uniswap/v3-sdk";
import _ from "lodash";

import { V3RouteInfo } from "../schema";

export async function parseV3Path(
  tokenProvider: ITokenProvider,
  _path: string,
  exactIn = true
): Promise<V3RouteInfo> {
  let tokenPathAddresses: string[] = [];
  let poolPathFees: string[] = [];

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
    poolPathFees.push(BigNumber.from(fee).toString());
    tokenPathAddresses.push(tokenOut);

    path = path.slice(46);
  }

  // path comes reversed for v3 exactout, flip it back
  if (!exactIn) {
    tokenPathAddresses = tokenPathAddresses.reverse();
    poolPathFees = poolPathFees.reverse();
  }

  const tokenPathAccessor = await tokenProvider.getTokens(tokenPathAddresses);
  const tokenPath = _(tokenPathAddresses)
    .map((t) => tokenPathAccessor.getTokenByAddress(t))
    .compact()
    .value();
  const tokenPathSymbols = _.map(tokenPath, (token) => `${token.symbol}`);

  const poolPath: Pool[] = [];
  const poolPathAddresses: string[] = [];
  for (let i = 0; i < tokenPathAddresses.length - 1; i++) {
    const tokenA = tokenPath[i];
    const tokenB = tokenPath[i + 1];

    poolPathAddresses.push(Pair.getAddress(tokenA, tokenB));
    poolPath.push(
      new Pool(
        tokenA,
        tokenB,
        parseFeeAmount(poolPathFees[i]),
        encodeSqrtRatioX96(1, 1),
        0,
        0
      )
    );
  }

  const poolPathSymbols = _.map(poolPath, poolToString);
  const poolFeePath = _.map(
    poolPath,
    (pool) =>
      ` -- ${pool.fee / 10000}% [${Pool.getAddress(
        pool.token0,
        pool.token1,
        pool.fee
      )}] --> `
  );

  const routeStr: string[] = ["[V3]: "];
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
}
