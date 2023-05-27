import { Stack, Input, Button, Stepper, Step, StepIndicator, StepStatus, StepIcon, StepSeparator, Text, useSteps, Flex } from '@chakra-ui/react'
import React from 'react'

const steps = [
    { title: 'Generating Proof', description: 'Calculating zkProof' },
    { title: 'Signing Shileder', description: 'Please Sign transaction to shielder contract' },
    { title: 'Transaction confirmation', description: 'Transfering your tokens to shielder contract' },
    { title: 'Done', description: 'Deposit completed' },
]


const Withdraw = () => {

    const { activeStep, setActiveStep, goToNext } = useSteps({
        index: 0,
        count: steps.length,
    });

    console.log(activeStep)
    const activeStepText = steps[activeStep].description;


    const fakeDeposit = () => {
        goToNext();
    }

    return (
        <Stack spacing={8}>
            <Flex flexDirection={'column'} gap={4}>
                <Input placeholder='Token ID' size='md' />
                <Input placeholder='Deposit amount' size='md' />
            </Flex>
            
            <Button onClick={fakeDeposit}>Deposit</Button>

            <Stack spacing={4}>
                <Stepper size='sm' index={activeStep} gap='0' showLastSeparator={false}>
                    {steps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus complete={<StepIcon />} />
                            </StepIndicator>
                            <StepSeparator _horizontal={{ ml: '0' }} />
                        </Step>
                    ))}
                </Stepper>
                <Text textAlign={'center'}>
                    <b>{activeStepText}</b>
                </Text>
            </Stack>
        </Stack>
    )
}

export default Withdraw
