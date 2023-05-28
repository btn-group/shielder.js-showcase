import { Button, Heading, Input, Link, Stack, Text } from '@chakra-ui/react'
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

  const [step, setStep] = useState(0);

  const [tokenId, setTokenId] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  const currentAddress = activeAccount?.address;
const { contract }  = shielderContract;

const getCurrentAllowance = async () => {
    if (api) {
      const contractApi = new ContractPromise(
        api,
        TokenABI,
        TOKEN_CONTRACT_ADDRESS
      );

    //   const { gasRequired } = await contractApi.query['psp22::increaseAllowance'](
    //     activeAccount?.address!,
    //     {
    //       gasLimit: api?.registry.createType("WeightV2", {
    //         refTime: MAX_CALL_WEIGHT,
    //         proofSize: PROOFSIZE,
    //       }) as WeightV2,
    //       storageDepositLimit: null,
    //     },
    //     SHIELDER_CONTRACT_ADDRESS, 10
    //   );
  
      const gasLimit = api?.registry.createType("WeightV2", {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as WeightV2;
  
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

              setStep(2);
            }
          });
        } else {
          console.log('api is not defined');
        }
      }

      const depositTokens = async () => {
        if(api) {
          const dep: Deposit = {
            token_id: 0,
            token_amount: 10,
            deposit_id: 0
          };
    
          setStep(3);
          const depositWasmResult = await deposit(dep);
          const depositWASMJSON = JSON.parse(depositWasmResult);
    
          const contractApi = new ContractPromise(
            api,
            ShielderABI,
            SHIELDER_CONTRACT_ADDRESS
          );
            /// read for leaf_idx
          const { gasRequired, result, output } = await contractApi.query['deposit'](
            activeAccount?.address!,
            {
              gasLimit: api?.registry.createType("WeightV2", {
                refTime: MAX_CALL_WEIGHT,
                proofSize: PROOFSIZE,
              }) as WeightV2,
              storageDepositLimit: null,
            },
            // tokenid, value, note, proof
            tokenId, depositAmount, depositWASMJSON.note.map((not: number) => `${not}`), `0x${depositWASMJSON.proof}`
          );
          
          const gasLimit = api?.registry.createType(
            "WeightV2",
            gasRequired
          ) as WeightV2;
    
          const res = await contractQuery(api, activeAccount?.address!, shielderContract?.contract!, 'deposit', {
            gasLimit,
            storageDepositLimit: null,
          }, [tokenId, depositAmount, depositWASMJSON.note.map((not: number) => `${not}`), `0x${depositWASMJSON.proof}`])
      
          
          let bare_leaf = res.output?.toJSON().ok.ok;
          depositWASMJSON.leaf_idx = bare_leaf - 1;
          depositWASMJSON.proof = `0x${depositWASMJSON.proof}`;
          setDepositJSON(depositWASMJSON)
    
          const queryTx = await contractApi.tx['deposit'](
              {
                gasLimit,
                storageDepositLimit: null,
              },
              tokenId, depositAmount, depositWASMJSON.note.map((not: number) => `${not}`), `0x${depositWASMJSON.proof}`
            );
          
            await queryTx.signAndSend(activeAccount?.address!, async (res) => {
              if (res.status.isInBlock) {
                console.log("in a block");
              } else if (res.status.isFinalized) {
                console.log("deposit finalized");
                setStep(4);
                // TODO: Save deposit to LS.
              }
            });
    
        } else {
          console.log('api is not defined');
        }
      }

      if(step === 2) {
        return (
            <CenterBody>
                <Stack minWidth={'400px'} spacing={8}>
                    <Stack spacing={2}>
                        <Heading>Deposit tokens</Heading>
                        <Text>Deposit AZERO tokens to Liminal Shielder.</Text>

                        <Text fontSize={'sm'} textColor={'gray.300'}>Current Allowance: {allowance}</Text>
                    </Stack>

                    <Stack spacing={2}>
                    <Text fontSize={'sm'} textColor={'gray.300'}>Deposit amount</Text>
                    <Input borderColor={'gray.500'} placeholder='Deposit amount' size='md' value={depositAmount} onChange={e => setDepositAmount(parseInt(e.target.value))} />
                </Stack>
    
                    <Button onClick={async () => await depositTokens()}
                        size="lg"
                        fontWeight="semibold"
                        rounded="md"
                        bgColor="white"
                        color="black"
                        _hover={{
                            background: "gray.200",
                        }}
                    >Deposit</Button>
    
                    
                </Stack>
            </CenterBody>
        )
      }

      if(step === 3) {
        return (
            <CenterBody>
                <Stack minWidth={'400px'} spacing={8}>
                    <Stack spacing={2}>
                        <Heading>Generating proof</Heading>
                        <Text>We’re generating proof for deposit.</Text>
                    </Stack>
    
    {/* TODO: Minin gif... */}
                    <Text fontSize={'sm'} textColor={'gray.300'}>Please wait. It might takes 2 minutes...</Text>
                </Stack>
            </CenterBody>
        )
      }

      if(step === 4) {
        return (
            <CenterBody>
                <Stack minWidth={'400px'} spacing={8}>
                    <Stack spacing={2}>
                        <Heading>Deposit successful</Heading>
                        <Text>Deposit successfully attached to the blockain.</Text>
                    </Stack>
    
    {/* TODO: Success gif... */}
    <Link
                    href="/deposit"
                    className="group"
                    tw="hover:no-underline no-underline self-center"
                 >
                     <Button 
                     bgColor="whiteAlpha.900"
                     fontWeight={'semibold'}
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
                    <Heading>Set allowance</Heading>
                    <Text>Set token allowance for the spender.</Text>

                    <Text fontSize={'sm'} textColor={'gray.300'}>Current Allowance: {allowance}</Text>
                </Stack>

                <Stack spacing={2}>
                    <Text fontSize={'sm'} textColor={'gray.300'}>TokenID</Text>
                    <Input borderColor={'gray.500'} placeholder='Token ID' size='md' value={tokenId} onChange={e => setTokenId(parseInt(e.target.value))} />
                    <Text fontSize={'sm'} textColor={'gray.300'}>Allowance Amount</Text>
                    <Input borderColor={'gray.500'} placeholder='Deposit amount' size='md' value={allowanceAmount} onChange={e => setAllowanceAmount(parseInt(e.target.value))} />
                </Stack>

                <Button onClick={async () => await increaseAllowance()}
                    size="lg"
                    fontWeight="semibold"
                    rounded="md"
                    bgColor="white"
                    color="black"
                    isDisabled={!activeAccount}
                    _hover={{
                        background: "gray.200",
                    }}
                >{!activeAccount ? "Connect wallet" : "Increase Allowance"}</Button>

                
            </Stack>
        </CenterBody>
    )
    
}

export default NewDeposit

