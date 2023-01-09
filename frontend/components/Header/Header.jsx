import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Flex, Text } from '@chakra-ui/react'

export const Header = () => {
  return (
    <Flex h="15vh" p="2rem" justifyContent="space-between" alignItems="center">
        <Text>Logo</Text>
        <ConnectButton />
    </Flex>
  )
};