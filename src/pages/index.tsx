import { HomePageTitle } from '@components/home/HomePageTitle'
import { CenterBody } from '@components/layout/CenterBody'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

import { initWasm } from 'shielder-sdk';
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
