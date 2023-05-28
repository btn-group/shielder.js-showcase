import { Box, Stack, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tfoot, Button, Text, HStack, Spacer, Flex, Link } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import 'twin.macro';
import { useLocalStorage } from '../../hooks';
import { useRouter } from 'next/router';

const Deposit = () => {
    
    const { setLocalStorageValue, getLocalStorageValue } = useLocalStorage();
    const [deposits, setDeposits] = useState([]);
    const [shouldLoad, setShouldLoad] = useState(true);

    const getDeposits = () => {
        const depositsJSONLS = getLocalStorageValue('deposits');
        const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
        console.log(depositsArr)
        return depositsArr;
    }

    useEffect(() => {
        if(deposits.length === 0 && shouldLoad) {
            const deps = getDeposits();
            console.log(deps);
            setDeposits(deps);
            setShouldLoad(false);
        }
    })

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
                                <Th textAlign={'center'}>Value</Th>
                                <Th textAlign={'right'}>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                        {deposits.map((deposit, index) => (
                            <Tr key={index}>
                                <Td>{deposit.proof.replace(/(.{50})..+/, "$1…")}</Td>
                                <Td textAlign={'center'}>{deposit.token_amount}</Td>
                                <Td>
                                    <Flex justifyContent={'flex-end'}>
                                    <Link
                                        href={`/withdraw/${deposit.leaf_idx}`}
                                        className="group"
                                        tw="hover:no-underline no-underline self-center"
                                    >
                                        <Button size={'sm'}>Withdraw</Button>
                                    </Link>
                                    </Flex>
                                </Td>
                            </Tr>
                        ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </Stack>
    )
}

export default Deposit;
