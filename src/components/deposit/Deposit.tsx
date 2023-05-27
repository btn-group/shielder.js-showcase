import { Button, Input, Stack, Step, StepDescription, StepIcon, StepIndicator, Stepper, StepSeparator, StepStatus, Text, useSteps } from '@chakra-ui/react'
import React, { useEffect } from 'react'


const steps = [
  { title: 'Sign Allowance', description: 'Please sign Allowance to use your tokens' },
  { title: 'Generate Proof', description: 'Calculating zkProof' },
  { title: 'Signing Shileder', description: 'Please Sign transaction to shielder contract' },
  { title: 'Transaction confirmation', description: 'Transfering your tokens to shielder contract' },
  { title: 'Done', description: 'Deposit completed' },
]

const Deposit = () => {
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
    <Stack spacing={3}>
      <Input placeholder='Token ID' size='md' />
      <Input placeholder='Deposit amount' size='md' />
      <Button onClick={fakeDeposit}>Deposit</Button>

      <Stack>
        <Stepper size='sm' index={activeStep} gap='0'>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} />
              </StepIndicator>
              <StepSeparator _horizontal={{ ml: '0' }} />
            </Step>
          ))}
        </Stepper>
        <Text>
          Step {activeStep + 1}: <b>{activeStepText}</b>
        </Text>
      </Stack>
    </Stack>
  )
}

export default Deposit

