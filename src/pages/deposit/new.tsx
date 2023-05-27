import { Button, Flex, Input, Stack, Step, StepIcon, StepIndicator, Stepper, StepSeparator, StepStatus, Text, useSteps } from '@chakra-ui/react'
import { CenterBody } from '@components/layout/CenterBody';
import React, { useEffect } from 'react'


const steps = [
    { title: 'Sign Allowance', description: 'Please sign Allowance to use your tokens' },
    { title: 'Generate Proof', description: 'Calculating zkProof' },
    { title: 'Signing Shileder', description: 'Please Sign transaction to shielder contract' },
    { title: 'Transaction confirmation', description: 'Transfering your tokens to shielder contract' },
    { title: 'Done', description: 'Deposit completed' },
]

const NewDeposit = () => {
    return (
        <CenterBody>

            <Stack spacing={8}>
                <Stack spacing={6}>
                    <Input placeholder='Token ID' size='md' />
                    <Input placeholder='Deposit amount' size='md' />
                </Stack>

                <Button onClick={() => console.log("Click")}
                    size="lg"
                    fontWeight="bold"
                    rounded="md"
                    bgColor="whiteAlpha.900"
                    color="black"
                    _hover={{
                        background: "whiteAlpha.800",
                    }}
                >Deposit</Button>
            </Stack>
        </CenterBody>
    )
}

export default NewDeposit

