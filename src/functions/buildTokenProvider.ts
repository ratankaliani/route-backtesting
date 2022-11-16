import { JsonRpcProvider } from "@ethersproject/providers";
import DEFAULT_TOKEN_LIST from "@uniswap/default-token-list";
import { Token } from "@uniswap/sdk-core";
import {
  CachingTokenListProvider,
  CachingTokenProviderWithFallback,
  NodeJSCache,
  TokenProvider,
  UniswapMulticallProvider,
} from "@uniswap/smart-order-router";
import NodeCache from "node-cache";

import { CHAIN } from "../index";


export const tokenCache = new NodeJSCache<Token>(
  new NodeCache({ stdTTL: 3600, useClones: false })
);

export async function buildProviders(rpcUrl: string) {
  const provider = new JsonRpcProvider(rpcUrl, CHAIN);

  const multicall2Provider = new UniswapMulticallProvider(CHAIN, provider);

  const tokenProvider = new CachingTokenProviderWithFallback(
    CHAIN,
    tokenCache,
    await CachingTokenListProvider.fromTokenList(
      CHAIN,
      DEFAULT_TOKEN_LIST,
      tokenCache
    ),
    new TokenProvider(CHAIN, multicall2Provider)
  );
  return { provider, tokenProvider };
}
