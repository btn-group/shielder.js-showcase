import { Button, HStack, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { CenterBody } from '@components/layout/CenterBody';
import { useLocalStorage } from '@hooks';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useInkathon, useContract, contractQuery } from '@scio-labs/use-inkathon'
import {deposit, Deposit, Withdraw, withdraw, parseData} from 'shielder-sdk';

import { WeightV2 } from '@polkadot/types/interfaces';
import { ContractPromise } from "@polkadot/api-contract";

import TokenABI from '../../abis/Token.json';
import ShielderABI from '../../abis/Shielder.json';
import { TOKEN_CONTRACT_ADDRESS, SHIELDER_CONTRACT_ADDRESS, MAX_CALL_WEIGHT, PROOFSIZE } from '@constants';
import { getCurrentAllowance, getCurrentMerkleRoot, getMerklePath, withdrawDryRun } from '@utils/shielder';
import { decodeAddress } from '@polkadot/util-crypto';

const withdrawView = () => {
  const router = useRouter();
  const depositLeafIdx = router.query.id;

  const { setLocalStorageValue, getLocalStorageValue } = useLocalStorage();

  const [depositToWithdraw, setDepositToWithdraw] = useState();
  const [shouldLoad, setShouldLoad] = useState(true);

  const [recipient, setRecipient] = useState('');

  const [allowance, setAllowance] = useState('0');
  const [depositJSON, setDepositJSON] = useState<Deposit>({});
  const {api, activeAccount} = useInkathon();
  const tokenContract = useContract(TokenABI, TOKEN_CONTRACT_ADDRESS);
  const shielderContract = useContract(ShielderABI, SHIELDER_CONTRACT_ADDRESS);

  const getDepositByLeafIdx = () => {
    const depositsJSONLS = getLocalStorageValue('deposits');
    const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
    const depositToWithdraw = depositsArr.filter(deposit => deposit.leaf_idx === parseInt(depositLeafIdx));

    return depositToWithdraw
  }

  const removeDepositFromLS = () => {
    const depositsJSONLS = getLocalStorageValue('deposits');
    const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
    const depositsWithoutCurrent = depositsArr.filter(deposit => deposit.leaf_idx !== parseInt(depositLeafIdx));

    setLocalStorageValue("deposits", JSON.stringify(depositsWithoutCurrent));
  }

  const withdrawTokens = async () => {
    console.log('before api');
    if (api) {
      console.log('before promise');
      const contractApi = new ContractPromise(
        api,
        ShielderABI,
        SHIELDER_CONTRACT_ADDRESS
      );
      console.log('before deposit');
      const deposit = getDepositByLeafIdx()[0];

      console.log("stored: ", deposit);

      const currentAddress = activeAccount?.address!;
      const { contract } = shielderContract;

      const currentMerkleRoot = await getCurrentMerkleRoot(
        api,
        currentAddress,
        contract!
      );
      console.log({ currentMerkleRoot });

      console.log(deposit);
      const merklePath = await getMerklePath(
        api,
        currentAddress,
        contract!,
        deposit.leaf_idx
      );
      // const merklePath = await getMerklePath(api, currentAddress, contract!, 65550);
      console.log({ merklePath });

      // TODO: Na razie pusty, testowy adres. Docelowo ma być input z frontu, albo obecnie połączony wallet.
      // const recipient = "5DWytQWs5WVg8akfFjavYFVkfUXBq11PZcfcTtH6tKqvboA6"; //burner

      const withdrawData: Withdraw = {
        deposit,
        withdraw_amount: deposit.token_amount,
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

          removeDepositFromLS();
          // TODO: Remove current deposit from local storage;
        }
      });
      
    } else {
      console.log("api is not defined");
    }
  };

  return (
    <CenterBody>
      <Stack minWidth={'400px'} spacing={8}>
                    <Stack spacing={2}>
                        <Heading>Withdraw</Heading>
                        <Text>Withdraw funds from deposit.</Text>
                    </Stack>

                    <Stack spacing={2}>
                      <Text fontSize={'sm'} textColor={'gray.300'}>Recipient</Text>
                      <Input borderColor={'gray.500'} size='md' value={recipient} onChange={e => setRecipient(e.target.value)} />
                    </Stack>
                    
                    <Button onClick={async () => await withdrawTokens()}
                        size="md"
                        fontWeight="semibold"
                        rounded="md"
                        bgColor="white"
                        color="black"
                        _hover={{
                            background: "gray.200",
                        }}
                    >Withdraw</Button>
                </Stack>

    
    </CenterBody>
  )
}

export default withdrawView;
