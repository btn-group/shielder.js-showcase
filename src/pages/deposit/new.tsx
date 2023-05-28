import { Button, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { CenterBody } from '@components/layout/CenterBody';
import React, { useEffect, useState } from 'react'

import { useInkathon, useContract, contractQuery } from '@scio-labs/use-inkathon'
import {deposit, Deposit, Withdraw, withdraw, parseData} from 'shielder-sdk';

import { WeightV2 } from '@polkadot/types/interfaces';
import { ContractPromise } from "@polkadot/api-contract";

import TokenABI from '../../abis/Token.json';
import ShielderABI from '../../abis/Shielder.json';
import { TOKEN_CONTRACT_ADDRESS, SHIELDER_CONTRACT_ADDRESS, MAX_CALL_WEIGHT, PROOFSIZE } from '@constants';
import { getCurrentAllowance } from '@utils/shielder';


const NewDeposit = () => {
    const [allowance, setAllowance] = useState('0');
  const [depositJSON, setDepositJSON] = useState<Deposit>({});
  const {api, activeAccount} = useInkathon();
  const tokenContract = useContract(TokenABI, TOKEN_CONTRACT_ADDRESS);
  const shielderContract = useContract(ShielderABI, SHIELDER_CONTRACT_ADDRESS);

  const [tokenId, setTokenId] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0);

  const currentAddress = activeAccount?.address;
const { contract }  = shielderContract;

const getCurrentAllowance = async () => {
    if (api) {
      const contractApi = new ContractPromise(
        api,
        TokenABI,
        TOKEN_CONTRACT_ADDRESS
      );

      const { gasRequired } = await contractApi.query['psp22::increaseAllowance'](
        activeAccount?.address!,
        {
          gasLimit: api?.registry.createType("WeightV2", {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
          }) as WeightV2,
          storageDepositLimit: null,
        },
        SHIELDER_CONTRACT_ADDRESS, 10
      );
  
      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;
  
      const res = await contractQuery(api, activeAccount?.address!, tokenContract?.contract!, 'psp22::allowance', {
        gasLimit,
        storageDepositLimit: null,
      }, [activeAccount?.address!, SHIELDER_CONTRACT_ADDRESS])
  
      console.log(res.output?.toJSON())
      setAllowance(res.output?.toJSON()?.ok);
    }
    
  }

  useEffect(() => {
    if(activeAccount) {
        getCurrentAllowance();
    }
    
  })

    const increaseAllowance = async () => {
        if(api) {
          const contractApi = new ContractPromise(
            api,
            TokenABI,
            TOKEN_CONTRACT_ADDRESS
          );
    
          const { gasRequired } = await contractApi.query['psp22::increaseAllowance'](
            activeAccount?.address!,
            {
              gasLimit: api?.registry.createType("WeightV2", {
                refTime: MAX_CALL_WEIGHT,
                proofSize: PROOFSIZE,
              }) as WeightV2,
              storageDepositLimit: null,
            },
            SHIELDER_CONTRACT_ADDRESS, allowanceAmount
          );
    
          const gasLimit = api?.registry.createType(
            "WeightV2",
            gasRequired
          ) as WeightV2;
    
          const queryTx = await contractApi.tx['psp22::increaseAllowance'](
            {
              gasLimit,
              storageDepositLimit: null,
            },
            SHIELDER_CONTRACT_ADDRESS, allowanceAmount
          );

          console.log(queryTx);
        
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
          console.log('api is not defined');
        }
      }

    return (
        <CenterBody>
            <Stack minWidth={'400px'} spacing={8}>
                <Stack spacing={2}>
                    <Heading>Set allowance</Heading>
                    <Text>Set token allowance for the spender.</Text>

                    <Text fontSize={'sm'} textColor={'gray.300'}>Current Allowance: {allowance}</Text>
                </Stack>

                <Stack spacing={2}>
                <Text fontSize={'sm'} textColor={'gray.300'}>TokenID</Text>
                    <Input placeholder='Token ID' size='md' value={tokenId} onChange={e => setTokenId(parseInt(e.target.value))} />
                    <Text fontSize={'sm'} textColor={'gray.300'}>Allowance Amount</Text>
                    <Input placeholder='Deposit amount' size='md' value={allowanceAmount} onChange={e => setAllowanceAmount(parseInt(e.target.value))} />
                </Stack>

                <Button onClick={async () => await increaseAllowance()}
                    size="lg"
                    fontWeight="semibold"
                    rounded="md"
                    bgColor="white"
                    color="black"
                    _hover={{
                        background: "gray.200",
                    }}
                >Increase Allowance</Button>

                
            </Stack>
        </CenterBody>
    )
}

export default NewDeposit

