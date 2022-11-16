#!/usr/bin/env node

import fs from "fs";

import { JsonRpcProvider } from "@ethersproject/providers";
import { ChainId, ITokenProvider } from "@uniswap/smart-order-router";
const fsPromises = fs.promises;

import _ from "lodash";
import invariant from "tiny-invariant";

import { buildProviders } from "./functions/buildTokenProvider";
import { buildTrade } from "./functions/buildTrade";
import { extractRoutes } from "./functions/extractRoutes";
import { CsvFileParser } from "./functions/fileParser";
import { ExtractedRoute, ExtractedTrade, ExtractedTradeFailed } from "./schema";
import { SwapRouter02__factory } from "./types/other/factories/SwapRouter02__factory";

export const CHAIN = ChainId.MAINNET;

/**
 * Takes a csv containing transaction calldata on SwapRouter02 and extracts the routes from them.
 *
 * Generates a JSON file containing each pools/tokens for each route in the swap and amounts/percentages for each route.
 *
 * During development can use via:
 *  yarn start extract-route ./test_extract_routes.csv "https://mainnet.infura.io/v3/<my_key>" ./output'
 *  yarn start extract-route <some_transaction_hash> "https://mainnet.infura.io/v3/<my_key>"
 */

export async function extractRoute(
  fileOrTxHash: string,
  rpcUrl: string,
  outFile?: string
): Promise<void> {
  let transactions: AsyncIterable<{ hash: string }> | Array<{ hash: string }>;

  let provider: JsonRpcProvider;
  let tokenProvider: ITokenProvider;

  if (outFile) {
    ({ tokenProvider, provider } = await buildProviders(rpcUrl));

    transactions = [{ hash: fileOrTxHash }];
  } else {
    ({ tokenProvider, provider } = await buildProviders(rpcUrl));

    transactions = new CsvFileParser().parseFile(fileOrTxHash);
  }

  const trades: (ExtractedTrade | ExtractedTradeFailed)[] = [];

  for await (const { hash } of transactions) {
    let data;
    try {
      ({ data } = await provider.getTransaction(hash));

      const swapRouter02 = SwapRouter02__factory.createInterface();

      // Must be a multicall if it came from our interface, assume so. Will error out later if not.
      const multicall = swapRouter02.parseTransaction({ data });

      // Get the routes from the call
      const routes: ExtractedRoute[] = await extractRoutes(
        multicall,
        swapRouter02,
        tokenProvider
      );

      // Check for weirdness. No guarantee every swap on the swap router came from our interface

      // Check all routes are exact in or out
      invariant(routes.every((r) => r.type == routes[0]!.type));

      // Check all routes start and end with same token. Just a way to filter out interleaving for now
      invariant(
        routes.every(
          (r) => r.tokenPathAddresses[0] == routes[0]!.tokenPathAddresses[0]
        )
      );
      invariant(
        routes.every(
          (r) =>
            r.tokenPathAddresses[r.tokenPathAddresses.length - 1] ==
            routes[0]!.tokenPathAddresses[
              routes[0]!.tokenPathAddresses.length - 1
            ]
        )
      );

      // Compute the final object we write to the output file, including calculating percentages of each route
      const trade: ExtractedTrade = buildTrade(routes, hash, data);

      trades.push(trade);
      console.log(
        `Successfully processed transaction${hash ? "with hash" : ""}` +
          hash +
          ". Processed " +
          trades.length +
          " transactions."
      );
    } catch (err) {
      // Could fail for many different reasons, just catch them all and write the error to the output file
      const fail: ExtractedTradeFailed = {
        hash,
        data: data ?? "Could not get data",
        errorReason: JSON.stringify(err),
      };
      trades.push(fail);
      console.log(
        "Failed to process transaction with hash " +
          hash +
          ". Processed " +
          trades.length +
          " transactions."
      );
    }
  }

  if (outFile) {
    // Better chunk since files can be huge
    const i = 1;
    for (const tradeChunk of _.chunk(trades, 250)) {
      const file = `${outFile}_${i}.json`;
      await fsPromises.writeFile(file, JSON.stringify(tradeChunk, null, 2));
      console.log(`Outputted results to ${file}`);
    }
  } else {
    console.log(JSON.stringify(trades[0]!, null, 2));
  }
}
