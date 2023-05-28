import { BN, BN_ONE } from "@polkadot/util";

export const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
export const PROOFSIZE = new BN(1_000_000);

export const SHIELDER_CONTRACT_ADDRESS = '5HnBJYL6esECRZ54HMLwJ58KKWhDoqE7iUajoAcFn6HcqKNJ';
export const TOKEN_CONTRACT_ADDRESS = '5GQmnWephhithqaBLSxmYAUSeVhJefL9RfBQ3e1aBXMoNc3v';
