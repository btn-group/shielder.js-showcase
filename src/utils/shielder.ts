import { contractQuery } from "@scio-labs/use-inkathon";
import {
  TOKEN_CONTRACT_ADDRESS,
  SHIELDER_CONTRACT_ADDRESS,
  MAX_CALL_WEIGHT,
  PROOFSIZE,
} from "@constants";
import { WeightV2 } from "@polkadot/types/interfaces";
import { ApiPromise } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { Deposit, Withdraw } from "shielder-sdk";
import TokenABI from "../abis/Token.json";

export const getCurrentAllowance = async (
  api: ApiPromise,
  activeAccount: any
) => {
  const contractApi = new ContractPromise(
    api,
    TokenABI,
    TOKEN_CONTRACT_ADDRESS
  );

  // const { gasRequired } = await contractApi.query['psp22::increaseAllowance'](
  //   accountAddress,
  //   {
  //     gasLimit: api?.registry.createType("WeightV2", {
  //       refTime: MAX_CALL_WEIGHT,
  //       proofSize: PROOFSIZE,
  //     }) as WeightV2,
  //     storageDepositLimit: null,
  //   },
  //   SHIELDER_CONTRACT_ADDRESS, 10
  // );

  // const gasLimit = api?.registry.createType(
  //   "WeightV2",
  //   gasRequired
  // ) as WeightV2;

  // const res = await contractQuery(api, accountAddress, contract, 'psp22::allowance', {
  //   gasLimit,
  //   storageDepositLimit: null,
  // }, [accountAddress, SHIELDER_CONTRACT_ADDRESS])

  // console.log(res.output?.toJSON())

  const { output: out } = await contractApi.query["psp22::allowance"](
    activeAccount?.address!,
    {
      gasLimit: api?.registry.createType("WeightV2", {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as WeightV2,
      storageDepositLimit: null,
    },
    SHIELDER_CONTRACT_ADDRESS,
    10
  );

  return res.output?.toJSON()?.ok;
};

export const getCurrentMerkleRoot = async (
  api: ApiPromise,
  accountAddress: string,
  shielderContract: ContractPromise
) => {
  const res = await contractQuery(
    api,
    accountAddress,
    shielderContract,
    "currentMerkleRoot",
    {
      gasLimit: api?.registry.createType("WeightV2", {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as WeightV2,
      storageDepositLimit: null,
    }
  );

  console.log("currentMerkleRoot", res.output?.toJSON());

  return res.output?.toJSON()!.ok!;
};

export const getMerklePath = async (
  api: ApiPromise,
  accountAddress: string,
  shielderContract: ContractPromise,
  leafIdx: number
) => {
  const res = await contractQuery(
    api,
    accountAddress,
    shielderContract,
    "merklePath",
    {
      gasLimit: api?.registry.createType("WeightV2", {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as WeightV2,
      storageDepositLimit: null,
    },
    [leafIdx]
  );

  console.log("merklePath", res.output?.toJSON());

  return res.output?.toJSON()!.ok!;
};

export const withdrawDryRun = async (
  api: ApiPromise,
  accountAddress: string,
  shielderContract: ContractPromise,
  withdrawData: Withdraw
) => {
  const args = [
    withdrawData.deposit.token_id,
    withdrawData.withdraw_amount,
    withdrawData.recipient,
    withdrawData.fee,
    withdrawData.merkle_root.map((num) => num.toString()),
    withdrawData.deposit.nullifier.map((num) => num.toString()),
    withdrawData.deposit.note.map((num) => num.toString()),
    withdrawData.deposit.proof,
  ];

  console.log(args);

  const res = await contractQuery(
    api,
    accountAddress,
    shielderContract,
    "withdraw",
    {
      gasLimit: api?.registry.createType("WeightV2", {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as WeightV2,
      storageDepositLimit: null,
    },
    args
  );

  console.log("withdrawDryRun", res.output?.toJSON());

  return res;

  // return res.output?.toJSON()!.ok!;
};
