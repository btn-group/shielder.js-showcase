import { useInkathon, useContract, contractQuery} from '@scio-labs/use-inkathon'
import {deposit, Deposit, Withdraw} from 'shielder-sdk';
import { Button, Flex, Text } from '@chakra-ui/react';

import { WeightV2 } from '@polkadot/types/interfaces';
import { ContractPromise } from "@polkadot/api-contract";
import { useEffect, useState } from 'react';

import TokenABI from '../../abis/Token.json';
import ShielderABI from '../../abis/Shielder.json';
import { TOKEN_CONTRACT_ADDRESS, SHIELDER_CONTRACT_ADDRESS, MAX_CALL_WEIGHT, PROOFSIZE } from '@constants';

export default function ContractCall() {
  const [allowance, setAllowance] = useState('0');
  const [depositJSON, setDepositJSON] = useState<Deposit>({});
  const {api, activeAccount} = useInkathon();
  const tokenContract = useContract(TokenABI, TOKEN_CONTRACT_ADDRESS);
  const shielderContract = useContract(ShielderABI, SHIELDER_CONTRACT_ADDRESS);

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

  const increaseAllowance = async () => {
    await getCurrentAllowance();

    if(api) {
      const contractApi = new ContractPromise(
        api,
        TokenABI,
        TOKEN_CONTRACT_ADDRESS
      );

      const { gasRequired, result, output } = await contractApi.query['psp22::increaseAllowance'](
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

      const queryTx = await contractApi.tx['psp22::increaseAllowance'](
        {
          gasLimit,
          storageDepositLimit: null,
        },
        SHIELDER_CONTRACT_ADDRESS, 10
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
        0, 10, depositWASMJSON.note.map((not: number) => `${not}`), `0x${depositWASMJSON.proof}`
      );
      
      const gasLimit = api?.registry.createType(
        "WeightV2",
        gasRequired
      ) as WeightV2;

      const res = await contractQuery(api, activeAccount?.address!, shielderContract?.contract!, 'deposit', {
        gasLimit,
        storageDepositLimit: null,
      }, [0, 10, depositWASMJSON.note.map((not: number) => `${not}`), `0x${depositWASMJSON.proof}`])
  
      console.log('leaf', res.output?.toJSON());
      let bare_leaf = res.output?.toJSON().ok.ok;
      depositWASMJSON.leaf_idx = bare_leaf;
      console.log('leaf2', depositWASMJSON.leaf_idx);
      setDepositJSON(depositWASMJSON)

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
            console.log("deposit finalized");
          }
        });

    } else {
      console.log('api is not defined');
    }
  }

  const withdrawTokens = async () => {
    if(api) {
        //TODO: get merkle root from Shielder
        //TODO: get merkle_path from Shielder
        //TODO: get recipient (field or connected wallet)


      const withdr: Withdraw = {
        deposit: depositJSON,
        withdraw_amount: depositJSON.token_amount,
        fee: 0,
        merkle_root: [0,0,0,0], //TODO change
        merkle_path: 0,         //TODO change
        recipient: 'dupa'       //TODO change
      };

      //TODO: Dry run Shielder.withdraw to get updated DepositJSON
      //TODO: SignAndCall Shielder.withdraw
      //TODO: Sace updated DepositJSON if token_amount != 0
    } else {
      console.log('api is not defined');
    }
  }

  useEffect(() => {
    if(depositJSON) {
      console.log(depositJSON);
    }
  }, [depositJSON])

  return (
    <Flex flexDirection={'column'} gap={2}>
      <Button px={4} py={3} bgColor={"white"} textColor={"black"} rounded={'md'} fontWeight={"semibold"} onClick={async () => await getCurrentAllowance()}>Get Current Allowance</Button>
      <Text textAlign={'center'}>Current Allowance: {allowance}</Text>
      <Button px={4} py={3} bgColor={"white"} textColor={"black"} rounded={'md'} fontWeight={"semibold"} onClick={async () => await increaseAllowance()}>Increase Allowance</Button>
      <Button px={4} py={3} bgColor={"white"} textColor={"black"} rounded={'md'} fontWeight={"semibold"} onClick={async () => await depositTokens()}>DEPOSIT</Button>
    </Flex>
    
  )
}
