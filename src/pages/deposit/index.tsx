import { Box, Stack, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tfoot, Button, Text, HStack, Spacer, Flex, Link } from '@chakra-ui/react'
import React from 'react'
import 'twin.macro'

const Deposit = () => {


    return (
        <Stack tw="p-16">
            <Flex alignItems={'flex-end'}>
                <Text fontSize="xl" fontWeight={'semibold'}>Current Deposits</Text>
                <Spacer />

                <Link
                    href="/deposit/new"
                    className="group"
                    tw="hover:no-underline no-underline self-center"
                 >
                     <Button 
                     rightIcon={<Text fontSize="xl">+</Text>}
                     bgColor="whiteAlpha.900"
                     fontWeight={'semibold'}
                     px={4}
                     py={3}
                     color="black"
                     _hover={{
                         background: "whiteAlpha.800",
                     }}
                 >
                        New Deposit
                    </Button>
                </Link>

                
            </Flex>
            <Box rounded="sm" border="0.2px">
                <TableContainer>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Proof</Th>
                                <Th textAlign={'center'}>Date</Th>
                                <Th textAlign={'center'} isNumeric>Value</Th>
                                <Th textAlign={'right'}>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>inches</Td>
                                <Td textAlign={'center'}>millimetres (mm)</Td>
                                <Td textAlign={'center'} isNumeric>25.4</Td>
                                <Td>
                                    <Flex justifyContent={'flex-end'}>
                                        <Button size="sm">Withdraw</Button>
                                    </Flex>
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </Stack>
    )
}

export default Deposit;
