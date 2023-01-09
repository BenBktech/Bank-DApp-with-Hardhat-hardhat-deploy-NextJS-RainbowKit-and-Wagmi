import { Spinner, Heading, Flex, Text, Input, Button, useToast, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer,  } from '@chakra-ui/react'
import { useAccount, useProvider, useSigner } from 'wagmi'
import { useState, useEffect } from 'react'
import Contract from "../../../backend/artifacts/contracts/Bank.sol/Bank.json"
import { ethers } from 'ethers';

export const Bank = () => {
    //WAGMI
    const { address, isConnected } = useAccount()
    const provider = useProvider()
    const { data: signer } = useSigner()

    //CHAKRA-UI
    const toast = useToast()

    //STATES
    const [balance, setBalance] = useState(null)
    const [amountDeposit, setAmountDeposit] = useState(null)
    const [amountWithdraw, setAmountWithdraw] = useState(null)
    const [events, setEvents] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
    let contractProviderMode, contractSignerMode;

    useEffect(() => {
        if(isConnected) {
            getDatas()
        }
    }, [isConnected])

    useEffect(() => {
        const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
        contract.on("etherDeposited", (account, amount) => {
            toast({
                title: 'Deposit Event',
                description: "Account : " + account + " - amount " + amount,
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        })
        return () => {
            contract.removeAllListeners();
        };
    }, [])

    const getDatas = async() => {
        //Datas
        const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
        let balanceAndLastDeposit = await contract.getBalanceOfUser()
        setBalance(balanceAndLastDeposit)

        //Get All the Events
        let filter = {
            address: contractAddress,
            fromBlock: 0
        };

        let events = await contract.queryFilter(filter)
        let allTheEvents = [];
        for await (const event of events) {
            const txnReceipt = await event.getTransactionReceipt();
            let eventLog = txnReceipt.logs[0] // could be any index
            let log = contract.interface.parseLog(eventLog); // Use the contracts interface
            allTheEvents.push(log)
        }
        setEvents(allTheEvents)
        console.log(allTheEvents)
    }

    const deposit = async() => {
        setIsLoading(true)
        try {
            const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
            let transaction = await contract.deposit({value: ethers.utils.parseEther(amountDeposit)})
            await transaction.wait(1)
            getDatas()
            toast({
                title: 'Deposit was successfull',
                description: "You have deposited Ethers on this smart contract, congratulations!",
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }
        catch(error) {
            toast({
                title: 'Error',
                description: "An error occured, please try again.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        }  
        setIsLoading(false)
    }

    const withdraw = async() => {
        setIsLoading(true)
        try {
            const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
            let transaction = await contract.withdraw(ethers.utils.parseEther(amountWithdraw))
            await transaction.wait(1)
            getDatas()
            toast({
                title: 'Withdraw was successfull',
                description: "You have withdrawed Ethers from this smart contract to your Wallet, congratulations!",
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }
        catch(error) {
            toast({
                title: 'Error',
                description: "An error occured, please try again.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        }  
        setIsLoading(false)
    }

    return (
        <>
            {isConnected ? (
                <Flex direction="column" p="2rem" alignItems="center">
                    <Heading as='h1' size='xl'>Bank DApp</Heading>
                    {isLoading ? (
                        <Spinner mt="2rem" size='xl' color="purple" />
                    ) : (
                        <>
                            balance && <Text mt="1rem">You have {ethers.utils.formatEther(balance)} Eth on the smart contract.</Text>
                            <Heading mt="2rem" as='h2' size='xl'>Deposit</Heading>
                            <Flex mt="1rem">
                                <Input placeholder='Amount in ETH' onChange={e => setAmountDeposit(e.target.value)} />
                                <Button colorScheme='purple' onClick={() => deposit()}>Deposit</Button>
                            </Flex>
                            <Heading mt="2rem" as='h2' size='xl'>Withdraw</Heading>
                            <Flex mt="1rem">
                                <Input placeholder='Amount in ETH' onChange={e => setAmountWithdraw(e.target.value)} />
                                <Button colorScheme='purple' onClick={() => withdraw()}>Withdraw</Button>
                            </Flex>
                            <Heading mt="2rem" as='h2' size='xl'>Last events</Heading>
                            <TableContainer mt="1rem">
                                <Table variant='simple'>
                                    <Thead>
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th>Account</Th>
                                            <Th isNumeric>Amount</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                    {events && (
                                        events.map(event => {
                                            return (
                                                <Tr>
                                                    <Td>{event.eventFragment.name}</Td>
                                                    <Td>{event.args.account}</Td>
                                                    <Td isNumeric>{ethers.utils.formatEther(event.args.amount)} ETH</Td>
                                                </Tr>
                                            )
                                        })
                                    )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Flex>
            ) : (
                <Flex h="85vh" p="2rem" justifyContent="center" alignItems="center">
                    Please connect your account with a wallet
                </Flex>
            )}
        </>
    )
};