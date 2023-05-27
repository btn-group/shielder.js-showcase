import { contractTx, useInkathon, useContract, contractCallDryRun, contractQuery} from '@scio-labs/use-inkathon'

import TokenABI from '../../abis/Token.json';
import ShielderABI from '../../abis/Shielder.json';
import { Button, Flex, Text } from '@chakra-ui/react';

import { BN, BN_ONE } from "@polkadot/util";
import { WeightV2 } from '@polkadot/types/interfaces';

import { ContractPromise } from "@polkadot/api-contract";
import { useState } from 'react';

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);

const shielderContractAddress = '5ETqdUdd2TLJuHxvXERxqHWh9M5ExKT5xpyJY69v1xSfso9d';
const tokenContractAddress = '5HZPNyNBLb7hZLGpERKUPExWCiBQiRAfhaY3X1UimDZpVJxs';

import {deposit, Deposit} from 'shielder-sdk';

export default function ContractCall() {
  const [allowance, setAllowance] = useState('0');
  const {api, activeAccount} = useInkathon();
  const contract = useContract(TokenABI, tokenContractAddress);

  const getCurrentAllowance = async () => {
    if (api) {
      const contractApi = new ContractPromise(
        api,
        TokenABI,
        tokenContractAddress
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
        shielderContractAddress, 10
      );
  
      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;
  
      const res = await contractQuery(api, activeAccount?.address!, contract?.contract!, 'psp22::allowance', {
        gasLimit,
        storageDepositLimit: null,
      }, [activeAccount?.address!, shielderContractAddress])
  
      console.log(res.output?.toJSON())
      setAllowance(res.output?.toJSON()?.ok);
    }
    
  }

  const increaseAllowance = async () => {
    console.log('call contract');
    await getCurrentAllowance();

    if(api) {

      const contractApi = new ContractPromise(
        api,
        TokenABI,
        tokenContractAddress
      );

      // const gasLimit = api?.registry.createType("WeightV2", {
      //   refTime: MAX_CALL_WEIGHT,
      //   proofSize: PROOFSIZE,
      // }) as WeightV2;
      // const storageDepositLimit = null;

      const { gasRequired, result, output } = await contractApi.query['psp22::increaseAllowance'](
        activeAccount?.address!,
        {
          gasLimit: api?.registry.createType("WeightV2", {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
          }) as WeightV2,
          storageDepositLimit: null,
        },
        shielderContractAddress, 10
      );

      // console.log({gasRequired, result, output});

      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;

      // console.log(api, activeAccount, contract);

      const queryTx = await contractApi.tx['psp22::increaseAllowance'](
        {
          gasLimit,
          storageDepositLimit: null,
        },
        shielderContractAddress, 10
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

      

      // const contractCallDryRunResult = await contractCallDryRun(api!, activeAccount?.address!, contract.contract!, 'psp22::increaseAllowance', {
      //   gasLimit,
      //   storageDepositLimit
      // }, ['5DeiFTx5mFBYqWvNECbZqnV4fZsvCQ7qgu3fp6F8HEY7ccHM', 10]);
    
      
      // console.log(contractCallDryRunResult.result?.toHuman())
  
      
  
      // const contractTxResult = await contractTx(api!, activeAccount?.address!, contract.contract!, 'PSP22::increase_allowance', {
      //   gasLimit,
      //   storageDepositLimit
      // }, ['5DeiFTx5mFBYqWvNECbZqnV4fZsvCQ7qgu3fp6F8HEY7ccHM', 10]);
  
      // console.log(contractTxResult.result?.toHuman());
    } else {
      console.log('api is not defined');
    }
  }

  const depositTokens = async () => {
    console.log('call deposit');
    // TODO: Generate PROOF

    if(api) {
      const dep: Deposit = {
        token_id: 0,
        token_amount: 10,
        deposit_id: 0
      };

      const depositWasmResult = await deposit(dep);
      console.log(depositWasmResult);
      const depositWASMJSON = JSON.parse(depositWasmResult);

      console.log(depositWASMJSON);

      const contractApi = new ContractPromise(
        api,
        ShielderABI,
        shielderContractAddress
      );

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
        0, 10, depositWASMJSON.note.map((not: number) => `${not}`), `0x${depositWASMJSON.proof}`
      );

      
      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;


      console.log({gasRequired, result, output});

      const queryTx = await contractApi.tx['deposit'](
          {
            gasLimit,
            storageDepositLimit: null,
          },
          0, 10, depositWASMJSON.note.map((not: number) => `${not}`), `0x${depositWASMJSON.proof}`
        );
      
        await queryTx.signAndSend(activeAccount?.address!, async (res) => {
          if (res.status.isInBlock) {
            console.log("in a block");
          } else if (res.status.isFinalized) {
            console.log("finalized");
            // console.log(`STATUS_TO_JSON: ${res.status.toJSON()}`);
            console.log(res.toHuman());
            console.log(res);
            // console.log(`EEEVVVEEENNTTTYYY: ${res.events}`);
          }
        });

    } else {
      console.log('api is not defined');
    }

    

  }

  return (
    <Flex flexDirection={'column'} gap={2}>
      <Button px={4} py={3} bgColor={"white"} textColor={"black"} rounded={'md'} fontWeight={"semibold"} onClick={async () => await getCurrentAllowance()}>Get Current Allowance</Button>
      <Text textAlign={'center'}>Current Allowance: {allowance}</Text>
      <Button px={4} py={3} bgColor={"white"} textColor={"black"} rounded={'md'} fontWeight={"semibold"} onClick={async () => await increaseAllowance()}>Increase Allowance</Button>
      <Button px={4} py={3} bgColor={"white"} textColor={"black"} rounded={'md'} fontWeight={"semibold"} onClick={async () => await depositTokens()}>DEPOSIT</Button>
    </Flex>
    
  )
}
