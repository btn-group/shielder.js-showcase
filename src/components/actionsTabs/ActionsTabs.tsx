import React from 'react'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box } from '@chakra-ui/react'
import Deposit from '@components/actionsTabs/Deposit'
import Withdraw from '@components/actionsTabs/Withdraw'

export const ActionsTabs = () => {
    return (
        <Box w="100%" padding={8} maxW='lg' borderWidth='1px' borderRadius='md' rounded={'md'} overflow='hidden'>
            <Tabs>
                <TabList>
                    <Tab >Deposit</Tab>
                    <Tab>Withdraw</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Deposit />
                    </TabPanel>
                    <TabPanel>
                        <Withdraw />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}
