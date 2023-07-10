import { BN, BN_ONE } from "@polkadot/util";

export const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
export const PROOFSIZE = new BN(1_000_000);

export const SHIELDER_CONTRACT_ADDRESS =
  "5Cjp2Vi1AEcjRxdcpMZYQ6HwkxRkNfbjk1X7m9iwgCyLM7jY";
export const TOKEN_CONTRACT_ADDRESS =
  "5GzQPCWbpBzd7iwWSMkxRnpjBV569Hp8QkY1n63zTEdcArhZ";
