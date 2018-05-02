import { TransactionReceipt } from "web3/types";

export interface SwapToken {
    address: string;
    decimals?: number;
    symbol: string;
}

export type SwapMode = 'aero_to_erc20'|'erc20_to_aero'|'erc20_to_erc20'|'aero_to_aero';

export interface SwapManager {
    expireSwap(swapId: string) : Promise<TransactionReceipt>;
    checkSwap(swapId: string) : Promise<any>;
}

export interface LoadedSwap {
    swapId: string;
    tokenAmount: string;
    tokenAmountFormated: number;
    tokenTrader: string;
    tokenAddress: string;
    tokenInfo?: any,
    counterpartyAmount: string;
    counterpartyAmountFormated: number;
    counterpartyTrader: string;
    counterpartyTokenAddress: string;
    counterpartyTokenInfo?: any,
    status: SwapStatus;
}

export type SwapStatus = 'Invalid' | 'Open' | 'Closed' | 'Expired';