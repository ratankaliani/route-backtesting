#!/usr/bin/env node
import { ChainId } from "@uniswap/smart-order-router";
export declare const CHAIN = ChainId.MAINNET;
/**
 * Takes a csv containing transaction calldata on SwapRouter02 and extracts the routes from them.
 *
 * Generates a JSON file containing each pools/tokens for each route in the swap and amounts/percentages for each route.
 *
 * During development can use via:
 *  yarn start extract-route ./test_extract_routes.csv "https://mainnet.infura.io/v3/<my_key>" ./output'
 *  yarn start extract-route <some_transaction_hash> "https://mainnet.infura.io/v3/<my_key>"
 */
export declare function extractRoute(fileOrTxHash: string, rpcUrl: string, outFile?: string): Promise<void>;
//# sourceMappingURL=index.d.ts.map