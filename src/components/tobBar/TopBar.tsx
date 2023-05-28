import { Box, Flex, Link, Spacer, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { ConnectButton } from '@components/web3/ConnectButton'
import shielderLogo from 'public/brand/shielder-logo.png'
import React from 'react'
import 'twin.macro'

const TopBar = () => {
    const githubHref = 'https://github.com/Degen-Alliance/shielder.js';
    
    return (
        <Flex tw="p-4" alignItems={'center'}>
            <Box>
                <Link
                    href="/"
                    className="group"
                    tw="flex cursor-pointer items-center gap-4 hover:no-underline no-underline rounded-md py-1.5 px-3.5 transition-all hover:bg-gray-900"
                >
                    <Image src={shielderLogo} priority width={26} alt="shielderJS Logo"></Image>
                    <Text tw="no-underline" fontWeight="bold" fontSize='2xl'>ShielderJS</Text>
                </Link>
            </Box>
            <Spacer />
            <Link tw="flex items-center py-2 mx-4" href="/deposit">
                <Text>Deposits</Text>
            </Link>
            <Link tw="flex items-center py-2 mx-4" href="/withdraw">
                <Text>Withdraw</Text>
            </Link>
            <Box>
                <ConnectButton />
            </Box>
        </Flex>
    )
}

export default TopBar
