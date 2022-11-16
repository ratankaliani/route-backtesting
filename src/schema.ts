import { Token } from "@uniswap/sdk-core";

export type ExtractedTrade = {
  hash: string;
  data: string;
  tokenIn: Token;
  tokenOut: Token;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  tokenInAddress: string;
  tokenOutAddress: string;
  routes: (ExtractedRoute & { percentage: string })[];
  totalAmountIn?: string;
  totalAmountOut?: string;
  totalAmountInDecimal?: string;
  totalAmountOutDecimal?: string;
  totalAmountOutMinimum?: string;
  totalAmountInMaximum?: string;
  totalAmountOutMinimumDecimal?: string;
  totalAmountInMaximumDecimal?: string;
};
export type ExtractedTradeFailed = {
  hash: string;
  data: string;
  errorReason: string;
};
type Route = {
  protocol: "V3" | "V2";
  type: "EXACT_IN" | "EXACT_OUT";
  tokenIn: Token;
  tokenOut: Token;
};
export type V3RouteInfo = {
  routeReadable: string;
  tokenPathSymbols: string[];
  tokenPathAddresses: string[];
  poolPathAddresses: string[];
  poolPathSymbols: string[];
  poolPathFees: string[];
  tokenIn: Token;
  tokenOut: Token;
};
export type V2RouteInfo = {
  routeReadable: string;
  tokenPathSymbols: string[];
  tokenPathAddresses: string[];
  poolPathAddresses: string[];
  poolPathSymbols: string[];
  tokenIn: Token;
  tokenOut: Token;
};
export type ExactInAmounts = {
  amountIn: string;
  amountOutMinimum: string;
};
export type ExactOutAmounts = {
  amountOut: string;
  amountInMaximum: string;
};
export type V3ExactIn = ExactInAmounts &
  Route &
  V3RouteInfo & {
    type: "EXACT_IN";
    protocol: "V3";
  };
export type V3ExactOut = ExactOutAmounts &
  Route &
  V3RouteInfo & {
    type: "EXACT_OUT";
    protocol: "V3";
  };
export type V2ExactIn = ExactInAmounts &
  Route &
  V2RouteInfo & { type: "EXACT_IN"; protocol: "V2" };
export type V2ExactOut = ExactOutAmounts &
  Route &
  V2RouteInfo & { type: "EXACT_OUT"; protocol: "V2" };
export type ExtractedRoute = V3ExactIn | V3ExactOut | V2ExactIn | V2ExactOut;
