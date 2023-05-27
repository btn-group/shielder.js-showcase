import { ActionsTabs } from '@components/actionsTabs/ActionsTabs'
import { HomePageTitle } from '@components/home/HomePageTitle'
import { CenterBody } from '@components/layout/CenterBody'
import { ChainInfo } from '@components/web3/ChainInfo'
import { ConnectButton } from '@components/web3/ConnectButton'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

import { initWasm, foo, deposit } from 'shielder-sdk';
import ContractCall from '@components/web3/ContractCall'
import TopBar from '@components/tobBar/TopBar'
import { MainView } from '@components/mainView/MainView'

const HomePage: NextPage = () => {
  const { accounts } = useInkathon();

  console.log(accounts![0]);

  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error]);

  useEffect(() => {
    async function init() {
      await initWasm();


    }

    init();
  })

  const clickFoo = async () => {
    // await run_prover();
    const start = Date.now();
    console.log(start)
    await deposit();
    const finish = Date.now();
    console.log(finish - start);
  }

  return (
    <>
      <CenterBody tw="mt-20 mb-10 px-5">
        {/* Title */}
        <HomePageTitle />
        <MainView />
      </CenterBody>
    </>
  )
}

export default HomePage
