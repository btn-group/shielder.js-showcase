import { Button, HStack, Heading, Input, Stack, Text, Image, Link } from '@chakra-ui/react';
import { CenterBody } from '@components/layout/CenterBody';
import { useLocalStorage } from '@hooks';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useInkathon, useContract } from '@scio-labs/use-inkathon'
import {Deposit, Withdraw, withdraw} from 'shielder-sdk';

import { WeightV2 } from '@polkadot/types/interfaces';
import { ContractPromise } from "@polkadot/api-contract";

import TokenABI from '../../abis/Token.json';
import ShielderABI from '../../abis/Shielder.json';
import { TOKEN_CONTRACT_ADDRESS, SHIELDER_CONTRACT_ADDRESS } from '@constants';
import { getCurrentMerkleRoot, getMerklePath, withdrawDryRun } from '@utils/shielder';
import { decodeAddress } from '@polkadot/util-crypto';

const withdrawView = () => {
  const router = useRouter();
  const depositLeafIdx = router.query.id;

  const [step, setStep] = useState(0);

  const { setLocalStorageValue, getLocalStorageValue } = useLocalStorage();

  const [recipient, setRecipient] = useState('');

  const {api, activeAccount} = useInkathon();
  const shielderContract = useContract(ShielderABI, SHIELDER_CONTRACT_ADDRESS);
  const [amount, setAmount] = useState(0);

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

      const withdrawData: Withdraw = {
        deposit,
        withdraw_amount: amount,
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


      // //TODO: Dry run Shielder.withdraw to get updated DepositJSON
      const withdrawDryRunResult = await withdrawDryRun(
        api,
        currentAddress,
        contract!,
        withdrawData
      );
      // console.log(withdrawDryRunResult.output?.toJSON().ok.err);
      if(withdrawDryRunResult.output?.toJSON().ok.err) {
        console.log('in err', withdrawDryRunResult.result.toJSON())
        setStep(4);
        return;
      }

      console.time("WITHDRAW");
      setStep(2);
      const withdrawWasmResult = await withdraw(withdrawData);
      console.timeEnd("WITHDRAW");
      const withdrawWASMJSON = JSON.parse(withdrawWasmResult);
      console.log({ withdrawWASMJSON });

      withdrawData.recipient = recipient;

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
          console.log(res.status.toHuman());
          setStep(3);

          removeDepositFromLS();
          if (withdrawWASMJSON.token_amount > 0) {
            withdrawWASMJSON.proof = `0x${withdrawWASMJSON.proof}`;
            const depositsJSONLS = getLocalStorageValue('deposits');
            const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
            depositsArr.push(withdrawWASMJSON)
            setLocalStorageValue("deposits", JSON.stringify(depositsArr));
          }
        }
      });
      
    } else {
      console.log("api is not defined");
    }
  };

  if(step === 2) {
    return (
        <CenterBody>
            <Stack minWidth={'400px'} spacing={8}>
                <Stack spacing={2}>
                    <Heading>Generating proof</Heading>
                    <Text>We’re generating proof for deposit.</Text>
                </Stack>

                <Stack mx={'auto'}>
                    <Image boxSize="200px" src="/mining-gif.gif" mx={'auto'} />
                </Stack>
                
                <Text fontSize={'sm'} textColor={'gray.300'}>Please wait. It might take up to 80 seconds...</Text>
            </Stack>
        </CenterBody>
    )
  }

  if(step === 3) {
    return (
        <CenterBody>
            <Stack minWidth={'400px'} spacing={8}>
                <Stack spacing={2}>
                    <Heading>Withdraw successful</Heading>
                    <Text>Withdrawed successfully from given deposit.</Text>
                </Stack>
            
            <Stack mx={'auto'} w={'full'}>
                <Image boxSize="200px" src="/party-gif.gif" mx={'auto'} />
            </Stack>

            <Link
                href="/deposit"
                className="group"
                tw="hover:no-underline no-underline self-center"
                width={'full'}
             >
                 <Button 
                 bgColor="whiteAlpha.900"
                 fontWeight={'semibold'}
                 width={'full'}
                 px={4}
                 py={3}
                 color="black"
                 _hover={{
                     background: "whiteAlpha.800",
                 }}
             >
                    Go to deposits
                </Button>
            </Link>
            </Stack>
        </CenterBody>
    )
  }

  if(step === 4) {
    return (
        <CenterBody>
            <Stack minWidth={'400px'} spacing={8}>
                <Stack spacing={2}>
                    <Heading>Withdraw failed</Heading>
                    <Text>Something failed. Please do not contact us.</Text>
                </Stack>
            
            <Stack mx={'auto'} w={'full'}>
                <Image boxSize="200px" src="/trashy-pepe.gif" mx={'auto'} />
            </Stack>

            <Link
                href="/deposit"
                className="group"
                tw="hover:no-underline no-underline self-center"
                width={'full'}
             >
                 <Button 
                 bgColor="whiteAlpha.900"
                 fontWeight={'semibold'}
                 width={'full'}
                 px={4}
                 py={3}
                 color="black"
                 _hover={{
                     background: "whiteAlpha.800",
                 }}
             >
                    Go to deposits
                </Button>
            </Link>
            </Stack>
        </CenterBody>
    )
  }

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

                    <Stack spacing={2}>
                      <Text fontSize={'sm'} textColor={'gray.300'}>Amount</Text>
                      <Input borderColor={'gray.500'} size='md' value={amount} onChange={e => setAmount(parseInt(e.target.value))} />
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
