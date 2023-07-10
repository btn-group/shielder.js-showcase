import {
  useInkathon,
  useContract,
  contractQuery,
} from "@scio-labs/use-inkathon";
import { deposit, Deposit, Withdraw, withdraw, parseData } from "shielder-sdk";
import { Button, Flex, Text } from "@chakra-ui/react";

import { WeightV2 } from "@polkadot/types/interfaces";
import { ContractPromise } from "@polkadot/api-contract";
import { useEffect, useState } from "react";
const { decodeAddress, encodeAddress } = require("@polkadot/keyring");

import { useLocalStorage } from "../../hooks";

import TokenABI from "../../abis/Token.json";
import ShielderABI from "../../abis/Shielder.json";
import {
  TOKEN_CONTRACT_ADDRESS,
  SHIELDER_CONTRACT_ADDRESS,
  MAX_CALL_WEIGHT,
  PROOFSIZE,
} from "@constants";
import {
  getCurrentMerkleRoot,
  getMerklePath,
  withdrawDryRun,
} from "@utils/shielder";

export default function ContractCall() {
  const [allowance, setAllowance] = useState("0");
  const [depositJSON, setDepositJSON] = useState<Deposit>({});
  const { api, activeAccount } = useInkathon();
  const tokenContract = useContract(TokenABI, TOKEN_CONTRACT_ADDRESS);
  const shielderContract = useContract(ShielderABI, SHIELDER_CONTRACT_ADDRESS);

  const { getLocalStorageValue } = useLocalStorage();

  const getCurrentAllowance = async () => {
    if (api) {
      const contractApi = new ContractPromise(
        api,
        TokenABI,
        TOKEN_CONTRACT_ADDRESS
      );

      const { gasRequired } = await contractApi.query[
        "psp22::increaseAllowance"
      ](
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

      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;

      const res = await contractQuery(
        api,
        activeAccount?.address!,
        tokenContract?.contract!,
        "psp22::allowance",
        {
          gasLimit,
          storageDepositLimit: null,
        },
        [activeAccount?.address!, SHIELDER_CONTRACT_ADDRESS]
      );

      console.log(res.output?.toJSON());
      setAllowance(res.output?.toJSON()?.ok);
    }
  };

  const increaseAllowance = async () => {
    if (api) {
      const contractApi = new ContractPromise(
        api,
        TokenABI,
        TOKEN_CONTRACT_ADDRESS
      );

      const { gasRequired, result, output } = await contractApi.query[
        "psp22::increaseAllowance"
      ](
        activeAccount?.address!,
        {
          gasLimit: api?.registry.createType("WeightV2", {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
          }) as WeightV2,
          storageDepositLimit: null,
        },
        SHIELDER_CONTRACT_ADDRESS,
        100
      );

      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;

      const queryTx = await contractApi.tx["psp22::increaseAllowance"](
        {
          gasLimit,
          storageDepositLimit: null,
        },
        SHIELDER_CONTRACT_ADDRESS,
        10
      );

      await queryTx.signAndSend(activeAccount?.address!, async (res) => {
        if (res.status.isInBlock) {
          console.log("in a block");
        } else if (res.status.isFinalized) {
          console.log("finalized");
          console.log("suckmycess");
          console.log(res.toHuman());
        }
      });
    } else {
      console.log("api is not defined");
    }
  };

  const depositTokens = async () => {
    if (api) {
      const dep: Deposit = {
        token_id: 0,
        token_amount: 10,
        deposit_id: 0,
      };

      const depositWasmResult = await deposit(dep);
      const depositWASMJSON = JSON.parse(depositWasmResult);

      const contractApi = new ContractPromise(
        api,
        ShielderABI,
        SHIELDER_CONTRACT_ADDRESS
      );
      /// read for leaf_idx
      const { gasRequired, result, output } = await contractApi.query[
        "deposit"
      ](
        activeAccount?.address!,
        {
          gasLimit: api?.registry.createType("WeightV2", {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
          }) as WeightV2,
          storageDepositLimit: null,
        },
        // tokenid, value, note, proof
        0,
        10,
        depositWASMJSON.note.map((not: number) => `${not}`),
        `0x${depositWASMJSON.proof}`
      );

      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;

      const res = await contractQuery(
        api,
        activeAccount?.address!,
        shielderContract?.contract!,
        "deposit",
        {
          gasLimit,
          storageDepositLimit: null,
        },
        [
          0,
          10,
          depositWASMJSON.note.map((not: number) => `${not}`),
          `0x${depositWASMJSON.proof}`,
        ]
      );

      let bare_leaf = res.output?.toJSON().ok.ok;
      depositWASMJSON.leaf_idx = bare_leaf - 1;
      depositWASMJSON.proof = `0x${depositWASMJSON.proof}`;
      setDepositJSON(depositWASMJSON);

      const queryTx = await contractApi.tx["deposit"](
        {
          gasLimit,
          storageDepositLimit: null,
        },
        0,
        10,
        depositWASMJSON.note.map((not: number) => `${not}`),
        `0x${depositWASMJSON.proof}`
      );

      await queryTx.signAndSend(activeAccount?.address!, async (res) => {
        if (res.status.isInBlock) {
          console.log("in a block");
        } else if (res.status.isFinalized) {
          console.log("deposit finalized");
        }
      });
    } else {
      console.log("api is not defined");
    }
  };

  const withdrawTokens = async () => {
    if (api) {
      const contractApi = new ContractPromise(
        api,
        ShielderABI,
        SHIELDER_CONTRACT_ADDRESS
      );

      const deposit = getLocalStorageValue("deposit");

      setDepositJSON(deposit);

      console.log("stored: ", deposit);

      const currentAddress = activeAccount?.address!;
      const { contract } = shielderContract;

      const currentMerkleRoot = await getCurrentMerkleRoot(
        api,
        currentAddress,
        contract!
      );
      console.log({ currentMerkleRoot });

      console.log(depositJSON);
      const merklePath = await getMerklePath(
        api,
        currentAddress,
        contract!,
        depositJSON.leaf_idx
      );
      // const merklePath = await getMerklePath(api, currentAddress, contract!, 65550);
      console.log({ merklePath });

      // TODO: Na razie pusty, testowy adres. Docelowo ma być input z frontu, albo obecnie połączony wallet.
      const recipient = "5DWytQWs5WVg8akfFjavYFVkfUXBq11PZcfcTtH6tKqvboA6"; //burner

      const withdrawData: Withdraw = {
        deposit: depositJSON,
        withdraw_amount: depositJSON.token_amount,
        recipient: Array.from(decodeAddress(recipient)),
        fee: 0,
        merkle_root: currentMerkleRoot.map((num) => {
          if (num !== 0) {
            return num.toString(16);
          }
          return "0x0";
        }),
        merkle_path: merklePath.map((arr) =>
          arr.map((num) => {
            if (num !== 0) {
              return num.toString(16);
            }
            return "0x0";
          })
        ),
      };

      console.log(withdrawData);

      console.time("WITHDRAW");
      const withdrawWasmResult = await withdraw(withdrawData);
      console.timeEnd("WITHDRAW");
      const withdrawWASMJSON = JSON.parse(withdrawWasmResult);
      console.log({ withdrawWASMJSON });

      withdrawData.recipient = recipient;

      // //TODO: Dry run Shielder.withdraw to get updated DepositJSON
      const withdrawDryRunResult = await withdrawDryRun(
        api,
        currentAddress,
        contract!,
        withdrawData
      );
      console.log({ withdrawDryRunResult });

      const { gasRequired } = withdrawDryRunResult;

      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;

      const queryTx = await contractApi.tx["withdraw"](
        {
          gasLimit,
          storageDepositLimit: null,
        },
        withdrawData.deposit.token_id,
        withdrawData.withdraw_amount,
        withdrawData.recipient,
        withdrawData.fee,
        withdrawData.merkle_root.map((num) => num.toString()),
        withdrawData.deposit.nullifier.map((num) => num.toString()),
        withdrawData.deposit.note.map((num) => num.toString()),
        withdrawData.deposit.proof
      );

      await queryTx.signAndSend(activeAccount?.address!, async (res) => {
        if (res.status.isInBlock) {
          console.log("in a block");
        } else if (res.status.isFinalized) {
          console.log("deposit finalized");
          console.log(res.status);
        }
      });
      //TODO: Sace updated DepositJSON if token_amount != 0
    } else {
      console.log("api is not defined");
    }
  };

  const getBalanceOf = async () => {
    if (api) {
      const contractApi = new ContractPromise(
        api,
        TokenABI,
        TOKEN_CONTRACT_ADDRESS
      );

      const { gasRequired } = await contractApi.query["psp22::balanceOf"](
        activeAccount?.address!,
        {
          gasLimit: api?.registry.createType("WeightV2", {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
          }) as WeightV2,
          storageDepositLimit: null,
        },
        activeAccount?.address!
      );

      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;

      const res = await contractQuery(
        api,
        activeAccount?.address!,
        tokenContract?.contract!,
        "psp22::allowance",
        {
          gasLimit,
          storageDepositLimit: null,
        },
        [activeAccount?.address!]
      );

      console.log(res.output?.toJSON());
      setBalance(res.output?.toJSON()?.ok);
    }
  };

  useEffect(() => {
    if (depositJSON) {
      console.log(depositJSON);
    }
  }, [depositJSON]);

  return (
    <Flex flexDirection={"column"} gap={2}>
      <Button
        px={4}
        py={3}
        bgColor={"white"}
        textColor={"black"}
        rounded={"md"}
        fontWeight={"semibold"}
        onClick={async () => await getCurrentAllowance()}
      >
        Get Current Allowance
      </Button>
      <Text textAlign={"center"}>Current Allowance: {allowance}</Text>
      <Button
        px={4}
        py={3}
        bgColor={"white"}
        textColor={"black"}
        rounded={"md"}
        fontWeight={"semibold"}
        onClick={async () => await increaseAllowance()}
      >
        Increase Allowance
      </Button>
      <Button
        px={4}
        py={3}
        bgColor={"white"}
        textColor={"black"}
        rounded={"md"}
        fontWeight={"semibold"}
        onClick={async () => await depositTokens()}
      >
        DEPOSIT
      </Button>
      <Button
        px={4}
        py={3}
        bgColor={"red.500"}
        textColor={"white"}
        rounded={"md"}
        fontWeight={"semibold"}
        onClick={async () => await withdrawTokens()}
      >
        WITHDRAW
      </Button>
    </Flex>
  );
}
