import { Box, Stack, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tfoot, Button, Text, HStack, Spacer } from '@chakra-ui/react'
import React from 'react'
import 'twin.macro'

const Deposit = () => {
    return (
        <Stack tw="p-16">
            <HStack>
                <Text fontSize="2xl">List of recently generated proofs</Text>
                <Spacer />
                <Button rightIcon={<Text fontSize="2xl">+</Text>}
                    bgColor="whiteAlpha.900"
                    color="black"
                    _hover={{
                        background: "whiteAlpha.800",
                    }}
                >New Deposit</Button>
            </HStack>
            <Box rounded="sm" border="0.2px">
                <TableContainer>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>To convert</Th>
                                <Th>into</Th>
                                <Th isNumeric>multiply by</Th>
                                <Th />
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>inches</Td>
                                <Td>millimetres (mm)</Td>
                                <Td isNumeric>25.4</Td>
                                <Td>
                                    <Button size="sm">Withdraw</Button>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>feet</Td>
                                <Td>centimetres (cm)</Td>
                                <Td isNumeric>30.48</Td>
                            </Tr>
                            <Tr>
                                <Td>yards</Td>
                                <Td>metres (m)</Td>
                                <Td isNumeric>0.91444</Td>
                            </Tr>
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>To convert</Th>
                                <Th>into</Th>
                                <Th isNumeric>multiply by</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            </Box>
        </Stack>
    )
}

export default Deposit;