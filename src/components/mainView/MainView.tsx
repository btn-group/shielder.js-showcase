import { HStack, Spacer, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import "twin.macro";

const hoverGradient = "linear(to-br,#009c87ff, #fb17e799)";

export const MainView = () => {
  return (
    <HStack alignItems="stretch">
      <VStack
        alignItems="stretch"
        justifyContent="space-between"
        spacing="28px"
        tw="w-1/2 rounded-md p-8"
        transition="all 1s"
        bgColor="gray.900"
        _hover={{
          bgColor: "gray.800",
        }}
      >
        <Text tw="pb-2" fontSize="2xl" fontWeight="Bold">
          Deposit
        </Text>
        <Text tw="pb-4" fontSize="md">
          Deposit your tokens to Liminal Shielder.
        </Text>
        <Link
          href="/deposit"
          className="group"
          tw="self-center no-underline hover:no-underline"
        >
          <Text
            fontWeight="semibold"
            rounded="md"
            bgColor="white"
            color="black"
            px={4}
            py={2}
            _hover={{
              background: "gray.200",
            }}
          >
            Let me deposit tokens!
          </Text>
        </Link>
      </VStack>

      <Spacer />

      <VStack
        alignItems="stretch"
        justifyContent="space-between"
        tw="w-1/2 rounded-md p-8"
        spacing="28px"
        bgColor="gray.900"
        _hover={{
          bgColor: "gray.800",
        }}
      >
        <Text tw="pb-2" fontSize="2xl" fontWeight="Bold">
          Withdraw
        </Text>
        <Text tw="pb-4" fontSize="md">
          Withdraw your tokens from Liminal Shielder deposit.
        </Text>
        <Link
          href="/withdraw"
          className="group"
          tw="self-center rounded-md no-underline hover:no-underline"
        >
          <Text
            fontWeight="semibold"
            rounded="md"
            bgColor="white"
            color="black"
            px={4}
            py={2}
            _hover={{
              background: "gray.200",
            }}
          >
            Let me withdraw tokens!
          </Text>
        </Link>
      </VStack>
    </HStack>
  );
};
