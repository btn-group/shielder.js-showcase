import {
  Box,
  Stack,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  Spacer,
  Flex,
  Link,
  Button,
  Input,
  FormLabel,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import "twin.macro";
import { useLocalStorage } from "../../hooks";

const Deposit = () => {
  const { setLocalStorageValue, getLocalStorageValue } = useLocalStorage();
  const [deposits, setDeposits] = useState([]);
  const [shouldLoad, setShouldLoad] = useState(true);

  const getDeposits = () => {
    const depositsJSONLS = getLocalStorageValue("deposits");
    const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
    console.log(depositsArr);
    return depositsArr;
  };

  const getDepositByLeafIdx = (id: string) => {
    const depositsJSONLS = getLocalStorageValue("deposits");
    const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
    const depositToWithdraw = depositsArr.filter(
      (deposit) => deposit.leaf_idx === parseInt(id)
    )[0];

    return depositToWithdraw;
  };

  useEffect(() => {
    if (shouldLoad) {
      const deps = getDeposits();
      console.log(deps);
      setDeposits(deps);
      setShouldLoad(false);
    }
  }, [shouldLoad]);

  const exportData = (id: string) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(getDepositByLeafIdx(id))
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";

    link.click();

    const answer = window.confirm(
      "You have exported deposit. Do you want to delete deposit from the app?"
    );
    if (answer) {
      const depositsJSONLS = getLocalStorageValue("deposits");
      const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
      const depositsWithoutCurrent = depositsArr.filter(
        (deposit) => deposit.leaf_idx !== parseInt(id)
      );

      setLocalStorageValue("deposits", JSON.stringify(depositsWithoutCurrent));
      setShouldLoad(true);
    }
  };

  const handleFileChange = (e: any) => {
    if (e.target.files) {
      console.log(e.target.files[0]);

      const reader = new FileReader();

      reader.onload = function (e) {
        const content = reader.result;
        const depositsJSONLS = getLocalStorageValue("deposits");
        const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
        depositsArr.push(JSON.parse(content));
        setLocalStorageValue("deposits", JSON.stringify(depositsArr));
        setShouldLoad(true);
      };

      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <Stack tw="p-16">
      <Flex alignItems={"flex-end"}>
        <Text fontSize="xl" fontWeight={"semibold"}>
          Current Deposits
        </Text>
        <Spacer />

        <Flex gap={2}>
          <Link
            href="/deposit/new"
            className="group"
            tw="self-center no-underline hover:no-underline"
          >
            <FormLabel
              htmlFor="file-input"
              bgColor="black"
              borderColor={"gray.400"}
              borderWidth={"1px"}
              fontWeight={"semibold"}
              rounded={"md"}
              px={4}
              py={2}
              color="gray.400"
              margin={0}
              cursor={"pointer"}
              _hover={{
                background: "gray.800",
              }}
            >
              Upload Deposit
            </FormLabel>
            <Input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              display={"none"}
            />
            {/* <Text 
                     bgColor="black"
                     borderColor={'gray.400'}
                     borderWidth={'1px'}
                     fontWeight={'semibold'}
                     rounded={'md'}
                     px={4}
                     py={2}
                     color="gray.400"
                     _hover={{
                         background: "gray.800",
                     }}
                 >
                        Upload Proof
                    </Text> */}
          </Link>

          <Link
            href="/deposit/new"
            className="group"
            tw="self-center no-underline hover:no-underline"
          >
            <Text
              bgColor="white"
              fontWeight={"semibold"}
              rounded={"md"}
              px={4}
              py={2}
              color="black"
              _hover={{
                background: "gray.200",
              }}
            >
              New Deposit
            </Text>
          </Link>
        </Flex>
      </Flex>
      <Box rounded="sm" border="0.2px">
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Proof</Th>
                <Th textAlign={"center"}>Value</Th>
                <Th textAlign={"right"}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deposits.map((deposit, index) => (
                <Tr key={index}>
                  <Td>{deposit.proof.replace(/(.{50})..+/, "$1…")}</Td>
                  <Td textAlign={"center"}>{deposit.token_amount}</Td>
                  <Td>
                    <Flex gap={1} justifyContent={"flex-end"}>
                      <Link
                        href={`/withdraw/${deposit.leaf_idx}`}
                        className="group"
                        tw="self-center no-underline hover:no-underline"
                      >
                        <Button size={"sm"}>Withdraw</Button>
                      </Link>

                      <Button
                        size={"sm"}
                        onClick={() => exportData(deposit.leaf_idx)}
                      >
                        Export
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
};

export default Deposit;
