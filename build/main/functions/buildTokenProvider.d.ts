import { JsonRpcProvider } from "@ethersproject/providers";
import { Token } from "@uniswap/sdk-core";
import { CachingTokenProviderWithFallback, NodeJSCache } from "@uniswap/smart-order-router";
export declare const tokenCache: NodeJSCache<Token>;
export declare function buildProviders(rpcUrl: string): Promise<{
    provider: JsonRpcProvider;
    tokenProvider: CachingTokenProviderWithFallback;
}>;
//# sourceMappingURL=buildTokenProvider.d.ts.map