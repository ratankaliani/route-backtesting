"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProviders = exports.tokenCache = void 0;
const providers_1 = require("@ethersproject/providers");
const default_token_list_1 = __importDefault(require("@uniswap/default-token-list"));
const smart_order_router_1 = require("@uniswap/smart-order-router");
const node_cache_1 = __importDefault(require("node-cache"));
const index_1 = require("../index");
exports.tokenCache = new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 3600, useClones: false }));
function buildProviders(rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new providers_1.JsonRpcProvider(rpcUrl, index_1.CHAIN);
        const multicall2Provider = new smart_order_router_1.UniswapMulticallProvider(index_1.CHAIN, provider);
        const tokenProvider = new smart_order_router_1.CachingTokenProviderWithFallback(index_1.CHAIN, exports.tokenCache, yield smart_order_router_1.CachingTokenListProvider.fromTokenList(index_1.CHAIN, default_token_list_1.default, exports.tokenCache), new smart_order_router_1.TokenProvider(index_1.CHAIN, multicall2Provider));
        return { provider, tokenProvider };
    });
}
exports.buildProviders = buildProviders;
