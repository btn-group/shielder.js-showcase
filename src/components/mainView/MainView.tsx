import { HStack, Spacer, VStack, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import 'twin.macro'

const hoverGradient = 'linear(to-br,#009c87ff, #fb17e799)';

export const MainView = () => {
    return (
        <HStack alignItems="stretch" >
            <VStack alignItems="stretch" justifyContent="space-between" spacing="28px" tw="p-8 w-1/2 rounded-md" transition="all 1s" bgColor="gray.900" _hover={{
                bgColor: 'gray.800'
            }}>
                <Text tw="pb-2" fontSize="2xl" fontWeight="Bold" >Deposit</Text>
                <Text tw="pb-4" fontSize="md">Deposit your tokens to Liminal Shielder.</Text>
                <Link
                    href="/deposit"
                    className="group"
                    tw="hover:no-underline no-underline self-center"
                >
                    <Button fontWeight="semibold"
                        rounded="md"
                        bgColor="whiteAlpha.900"
                        color="black"
                        _hover={{
                            background: "whiteAlpha.800",
                        }}>
                        Let me deposit tokens!
                    </Button>
                </Link>
            </VStack>

            <Spacer />

            <VStack alignItems="stretch" justifyContent="space-between" tw="p-8 w-1/2 rounded-md" spacing="28px" bgColor="gray.900" _hover={{
                bgColor: 'gray.800'
            }}>

                <Text tw="pb-2" fontSize="2xl" fontWeight="Bold" >Withdraw</Text>
                <Text tw="pb-4" fontSize="md">Withdraw your tokens from Liminal Shielder deposit.</Text>
                <Link
                    href="/withdraw"
                    className="group"
                    tw="hover:no-underline no-underline rounded-md self-center"
                >
                    <Button 
                        fontWeight="semibold"
                        rounded="md"
                        bgColor="whiteAlpha.900"
                        color="black"
                        _hover={{
                            background: "whiteAlpha.800",
                        }}>
                        Let me withdraw tokens!
                    </Button>
                </Link>
            </VStack>
        </HStack>
    )
}
