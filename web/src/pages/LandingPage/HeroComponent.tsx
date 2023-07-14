import {
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  Heading,
  SimpleGrid,
  Badge,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  Flex,
  useBreakpointValue,
  Icon,
  VStack,
  HStack,
  Button,
  Spacer
} from "@chakra-ui/react";
import {
  HeroComponentProps
} from "../../helpers/interfaces";
import { bytesToMegabytes, parseDate, truncateString, toBackgroundImagefromSrc, projectsPageSteps } from "../../helpers/utils";
import { FiTarget, FiZap, FiEye, FiUser, FiMapPin, FiWifi } from "react-icons/fi"; // you need to install `react-icons` for this.
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Joyride, { STATUS } from "react-joyride";


export function HeroComponent({ project, circuits, contributions }: HeroComponentProps) {
    const projectClean = {
        title: project.ceremony.data.title,
        description: project.ceremony.data.description,
        state: project.ceremony.data.state
    };

    const [runTutorial, setRunTutorial] = useState(false)
 
    // handle the callback from joyride
    const handleJoyrideCallback = (data: any) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        // Need to set our running state to false, so we can restart if we click start again.
        setRunTutorial(false)
        }
    };

    useEffect(() => {
        setRunTutorial(true)
    }, [])

  const circuitsClean = circuits.map((circuit) => ({
        name: circuit.data.name,
        description: circuit.data.description,
        constraints: circuit.data.metadata?.constraints,
        pot: circuit.data.metadata?.pot,
        privateInputs: circuit.data.metadata?.privateInputs,
        publicInputs: circuit.data.metadata?.publicInputs,
        curve: circuit.data.metadata?.curve,
        wires: circuit.data.metadata?.wires,
        completedContributions: circuit.data.waitingQueue?.completedContributions,
        currentContributor: circuit.data.waitingQueue?.currentContributor,
        memoryRequirement: bytesToMegabytes(circuit.data.zKeySizeInBytes ?? Math.pow(1024, 2))
        .toString()
        .slice(0, 5),
        avgTimingContribution: Math.round(Number(circuit.data.avgTimings?.fullContribution) / 1000),
        maxTiming: Math.round((Number(circuit.data.avgTimings?.fullContribution) * 1.618) / 1000)
  }));

  const contributionsClean = contributions.map((contribution) => ({
    doc: contribution.data.files.lastZkeyFilename,

    verificationComputationTime: contribution.data.verificationComputationTime,

    valid: contribution.data.valid,

    lastUpdated: parseDate(contribution.data.lastUpdated),

    lastZkeyBlake2bHash: truncateString(contribution.data.files.lastZkeyBlake2bHash, 10),

    transcriptBlake2bHash: truncateString(contribution.data.files.transcriptBlake2bHash, 10)
  }));

  const columns = useBreakpointValue({ base: 1, md: 2, lg: 2 });

  return (
    <>
        <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runTutorial}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={projectsPageSteps}
        styles={{
            options: {
            arrowColor: 'red',
            backgroundColor: 'white',
            overlayColor: 'rgba(79, 26, 0, 0.4)',
            primaryColor: 'red',
            textColor: 'black',
            width: '500px',
            zIndex: 1000,
            }
        }}
    />
    <VStack alignSelf={"stretch"} alignItems={"center"} spacing={8}>
        <VStack
            alignSelf={"stretch"}
            alignItems={"center"}
            bgImage={toBackgroundImagefromSrc(
            "https://cdn.midjourney.com/7040b05f-3757-4cd5-80e6-21484ea03987/0_2.png"
            )}
            bgSize="cover"
            bgPosition="center"
            bgRepeat="no-repeat"
            pb={8}
        >
            <VStack
            className="tutorialDescription"
            alignSelf={"stretch"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={8}
            py={16}
            >
            <Text textAlign={"center"} fontWeight={"700"} fontSize={"3.5rem"} maxW="15ch">
                {" "}
                How it works
            </Text>
            <Text
                textAlign={"center"}
                fontWeight={"500"}
                fontSize={"12px"}
                maxW="50ch"
                letterSpacing={"0.01rem"}
            >
                {" "}
                DefinitelySetup is a product designed to run Trusted Setup ceremonies for groth16 based snarks - powered by p0tion.  
                Thanks to p0tion, PSE can setup and manage trusted setups for the community (subject to approval).  
            </Text>
            <Text textAlign={"center"} fontWeight={"600"} fontSize={"18px"} maxW="30ch">
                {" "}
                Search for ceremonies, contribute your entropy to the system.
            </Text>
            <Text textAlign={"center"} fontWeight={"500"} fontSize={"12px"} maxW="50ch">
                {" "}
                In this website you will be able to browse all ceremonies created with p0tion, as well as understand how to contribute to it and retrieve the final artifacts.
                Let's secure GROTH16 protocols together.
            </Text>

            <HStack
            className="tutorialButtons">
                <Button
                as={Link}
                to="/projects/ceremonysetup0123p0tion"
                fontSize={14}
                width="6.5rem"
                variant="outline"
                borderRadius={0}
                borderColor={"transparent"}
                bg={"gray.800"}
                color={"gray.100"}
                minH="50px"
                >
                Contribute
                </Button>
                <Button
                as={Link}
                to="/projects/ceremonysetup0123p0tion"
                fontSize={14}
                width="6.5rem"
                variant="outline"
                borderRadius={0}
                borderColor={"transparent"}
                bg={"gray.800"}
                color={"gray.100"}
                minH="50px"
                >
                Watch
                </Button>
            </HStack>
            </VStack>
        </VStack>
        <Box className="tutorialLiveLook" alignItems="center" p={8} alignSelf={"stretch"} maxW={"container.sm"} mx="auto">
            <HStack justifyContent={"space-between"} alignSelf={"stretch"}>
            <Heading size="md" mb={6} fontWeight={"bold"} letterSpacing={"3%"}>
                Live Look
            </Heading>
            <Spacer />
            </HStack>
            <VStack
            alignSelf={"stretch"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={8}
            ></VStack>
            <HStack justifyContent={"space-between"}>
            <Heading fontSize={18} mb={6}>
                {projectClean.title}
            </Heading>
            <Badge colorScheme="green" p="2" mb="4">
                {projectClean.state}
            </Badge>
            </HStack>
            <Text fontSize={14} mb={4}>
            {projectClean.description}
            </Text>

            <Box alignItems="center" py={4}>
            <SimpleGrid columns={columns} spacing={6}>
                {circuitsClean.map((circuit, index) => (
                <Box key={index} borderWidth={1} borderRadius="lg" p={4}>
                    <Heading fontSize={16} size="md" mb={2}>
                    {circuit.name} - {circuit.description}
                    </Heading>
                    <Flex wrap="wrap" mb={4}>
                    <Tag fontSize={10} size="sm" colorScheme="purple" mr={2} mb={2}>
                        <Icon as={FiTarget} mr={1} />
                        Constraints: {circuit.constraints}
                    </Tag>
                    <Tag fontSize={10} size="sm" colorScheme="cyan" mr={2} mb={2}>
                        <Icon as={FiZap} mr={1} />
                        Pot: {circuit.pot}
                    </Tag>
                    <Tag fontSize={10} size="sm" colorScheme="yellow" mr={2} mb={2}>
                        <Icon as={FiEye} mr={1} />
                        Private Inputs: {circuit.privateInputs}
                    </Tag>
                    <Tag fontSize={10} size="sm" colorScheme="pink" mr={2} mb={2}>
                        <Icon as={FiUser} mr={1} />
                        Public Inputs: {circuit.publicInputs}
                    </Tag>
                    <Tag fontSize={10} size="sm" colorScheme="blue" mr={2} mb={2}>
                        <Icon as={FiMapPin} mr={1} />
                        Curve: {circuit.curve}
                    </Tag>
                    <Tag fontSize={10} size="sm" colorScheme="teal" mr={2} mb={2}>
                        <Icon as={FiWifi} mr={1} />
                        Wires: {circuit.wires}
                    </Tag>
                    </Flex>
                    <SimpleGrid columns={[2, 2]} spacing={6}>
                    <Flex justify="space-between" align="center">
                        <Stat>
                        <StatLabel fontSize={12}>Completed Contributions</StatLabel>
                        <StatNumber fontSize={16}>{circuit.completedContributions}</StatNumber>
                        </Stat>
                    </Flex>
                    <Stat>
                        <StatLabel fontSize={12}>Memory Requirement</StatLabel>
                        <StatNumber fontSize={16}>{circuit.memoryRequirement} mb</StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel fontSize={12}>Avg Contribution Time</StatLabel>
                        <StatNumber fontSize={16}>{circuit.avgTimingContribution}s</StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel fontSize={12}>Max Contribution Time</StatLabel>
                        <StatNumber fontSize={16}>{circuit.maxTiming}s</StatNumber>
                    </Stat>
                    </SimpleGrid>
                </Box>
                ))}
            </SimpleGrid>
            </Box>
            <VStack maxW={"390px"}>
            <HStack justifyContent={"space-between"} alignSelf={"stretch"} >
                <Heading fontSize="18" mb={6} fontWeight={"bold"} letterSpacing={"3%"}>
                Contributions
                </Heading>
                <Spacer />
            </HStack>
            <Box className="tutorialContributionsList" maxW={"320px"} overflowX={"scroll"}>
                <Table fontSize={12} variant="simple">
                <Thead>
                    <Tr>
                    <Th>Doc</Th>
                    <Th >Contribution Date</Th>
                    {/* <Th>Contribution Time</Th> */}
                    <Th>Hashes</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {contributionsClean.map((contribution, index) => (
                    <Tr key={index}>
                        <Td>{contribution.doc}</Td>
                        <Td>{contribution.lastUpdated}</Td>
                        {/* <Td>{contribution.verificationComputationTime}</Td> */}
                        <Td>
                        <Tooltip label={contribution.lastZkeyBlake2bHash} aria-label="Last Zkey Hash">
                            <Tag fontSize={12}>{contribution.lastZkeyBlake2bHash}</Tag>
                        </Tooltip>
                        </Td>
                    </Tr>
                    ))}
                </Tbody>
                </Table>
            </Box>
            </VStack>
        </Box>
        </VStack>
        </>

    );
}
