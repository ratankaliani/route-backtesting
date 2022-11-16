import { ITokenProvider } from "@uniswap/smart-order-router";
import { TransactionDescription } from "ethers/lib/utils";
import { ExtractedRoute } from "../schema";
import { SwapRouter02Interface } from "../types/other/SwapRouter02";
export declare function extractRoutes(multicall: TransactionDescription, swapRouter02: SwapRouter02Interface, tokenProvider: ITokenProvider): Promise<ExtractedRoute[]>;
//# sourceMappingURL=extractRoutes.d.ts.map