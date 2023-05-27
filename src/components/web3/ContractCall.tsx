import { contractTx, useInkathon, useContract, contractCallDryRun} from '@scio-labs/use-inkathon'

import TokenABI from '../../abis/Token.json';
import { ContractPromise } from '@polkadot/api-contract';
import { Button } from '@chakra-ui/react';

import { BN, BN_ONE } from "@polkadot/util";
import { WeightV2 } from '@polkadot/types/interfaces';

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);

export default function ContractCall() {
  const {api, activeAccount} = useInkathon();
  const contract = useContract(TokenABI, '5HZPNyNBLb7hZLGpERKUPExWCiBQiRAfhaY3X1UimDZpVJxs');

  const value = 10000; // only for payable messages, call will fail otherwise
  
  const gasLimit = api?.registry.createType("WeightV2", {
    refTime: MAX_CALL_WEIGHT,
    proofSize: PROOFSIZE,
  }) as WeightV2;
  const storageDepositLimit = null;

  const callContract = async () => {
    console.log('call contract');

    
    
  
    const res = await contractCallDryRun(api!, activeAccount?.address!, contract.contract!, 'PSP22::increase_allowance', {
      gasLimit,
      storageDepositLimit, value
    }, ['5DeiFTx5mFBYqWvNECbZqnV4fZsvCQ7qgu3fp6F8HEY7ccHM', 10]);
  
    console.log(res);
  }

  return (
    <Button px={4} py={3} bgColor={"white"} textColor={"black"} rounded={'md'} fontWeight={"semibold"} onClick={async () => await callContract()}>CALL ME BABE</Button>
  )
}
