import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useClipboard,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Heading,
  Spacer,
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  Icon,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr
} from "@chakra-ui/react";
import { StateContext } from "../context/StateContext";
import {
  ProjectData,
  ProjectDataSchema,
  useProjectPageContext
} from "../context/ProjectPageContext";
import { FaCloudDownloadAlt, FaCopy } from "react-icons/fa";
import { CeremonyState } from "../helpers/interfaces";
import { bytesToMegabytes } from "./LandingPage/truncateString";
import { FiTarget, FiZap, FiEye, FiUser, FiMapPin, FiWifi } from "react-icons/fi";

type RouteParams = {
  ceremonyName: string | undefined;
};

function truncateString(str: string, numCharacters = 5): string {
  if (str.length <= numCharacters * 2) {
    return str;
  }

  const firstPart = str.substr(0, numCharacters);
  const lastPart = str.substr(-numCharacters);

  return `${firstPart}...${lastPart}`;
}

function parseDate(dateString: number): string {
  const parsedDate = new Date(dateString);
  return parsedDate.toDateString();
}

const formatDate = (date: Date): string =>
  `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(
    2,
    "0"
  )}.${String(date.getFullYear()).slice(-2)}`;

// Get a human-readable string indicating how far in the future or past a date is
const getTimeDifference = (date: Date): string => {
  const currentDate = new Date();
  const differenceInTime = date.getTime() - currentDate.getTime();
  const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));

  if (differenceInDays < 0) return `${Math.abs(differenceInDays)} days ago`;
  if (differenceInDays > 0) return `${differenceInDays} days from now`;
  return "Today";
};

const ProjectPage: React.FC = () => {
  const { ceremonyName } = useParams<RouteParams>();
  const { projects } = useContext(StateContext);
  const { projectData, isLoading } = useProjectPageContext();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const project = projects.find((p) => p.ceremony.data.title === ceremonyName);

  if (!project || !projectData) {
    return <Text>Error loading project.</Text>;
  }

  // Validate the project data against the schema
  const validatedProjectData: ProjectData = ProjectDataSchema.parse(projectData);
  console.log("project", project);
  console.log("validatedProjectData", validatedProjectData);
  /// @todo work on multiple circuits.
  /// @todo uncomplete info for mocked fallback circuit data.

  const circuitsClean = validatedProjectData.circuits?.map((circuit) => ({
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
      .substr(0, 5),
    avgTimingContribution: Math.round(Number(circuit.data.avgTimings?.fullContribution) / 1000),
    maxTiming: Math.round((Number(circuit.data.avgTimings?.fullContribution) * 1.618) / 1000)
  }))??[]

  const contributionsClean = validatedProjectData.contributions?.map((contribution) => ({
    doc: contribution.data.files.lastZkeyFilename,

    verificationComputationTime: contribution.data.verificationComputationTime,

    valid: contribution.data.valid,

    lastUpdated: parseDate(contribution.data.lastUpdated),

    lastZkeyBlake2bHash: truncateString(contribution.data.files.lastZkeyBlake2bHash, 10),

    transcriptBlake2bHash: truncateString(contribution.data.files.transcriptBlake2bHash, 10)
  })) ??[]

  const circuit = validatedProjectData.circuits
    ? validatedProjectData.circuits[0]
    : {
        data: {
          fixedTimeWindow: 10,
          template: {
            source: "todo",
            paramsConfiguration: [2, 3, 4]
          },
          compiler: {
            version: "0.5.1",
            commitHash: "0xabc"
          },
          avgTimings: {
            fullContribution: 100
          },
          zKeySizeInBytes: 10,
          waitingQueue: {
            completedContributions: 0
          }
        }
      };

  // Commands
  const contributeCommand = `phase2cli auth && phase2cli contribute -c ${project.ceremony.data.prefix}`;
  const zKeyFilename = `${circuit.data.prefix}_final.zkey`;
  const downloadLink = `https://${project.ceremony.data.prefix}${
    import.meta.env.VITE_CONFIG_CEREMONY_BUCKET_POSTFIX
  }.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/circuits/${
    circuit.data.prefix
  }/contributions/${zKeyFilename}`;
  // Hook for clipboard
  const { onCopy: copyContribute, hasCopied: copiedContribute } = useClipboard(contributeCommand);

  /// @todo with a bit of refactor, could be used everywhere for downloading files from S3.
  // Download a file from AWS S3 bucket.
  const downloadFileFromS3 = () => {
    fetch(downloadLink).then((response) => {
      response.blob().then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);

        let alink = document.createElement("a");
        alink.href = fileURL;
        alink.download = zKeyFilename;
        alink.click();
      });
    });
  };

  return (
    <HStack
      fontSize={12}
      minW="375px"
      minH={[null, null, "100vh"]}
      w="100%"
      alignItems="flex-start"
      alignSelf={"stretch"}
      justifyContent={"flex-start"}
      flexWrap={"wrap"}
      spacing={0}
      py={5}
    >
      <VStack
        minH={[null, null, "100vh"]}
        margin="auto"
        maxW={["390px", "390px", "300px"]}
        alignSelf={"stretch"}
        alignItems="flex-start"
        p={8}
      >
        <VStack align="start" spacing={2} py={2} alignSelf={"stretch"}>
          <Heading fontSize={16} fontWeight="bold">
            {project.ceremony.data.title}
          </Heading>
          <Breadcrumb separator="•">
            <BreadcrumbItem>
              <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                {formatDate(new Date(project.ceremony.data.startDate))}
              </Text>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                Deadline: {getTimeDifference(new Date(project.ceremony.data.endDate))}
              </Text>
            </BreadcrumbItem>
          </Breadcrumb>
          {/* <Text fontSize={12} fontWeight="regular" color={"gray.500"}>{project.ceremony.data.description}</Text> */}
        </VStack>

        <VStack align="start" spacing={2} py={2} alignSelf={"stretch"}>
          <Text fontSize={12} fontWeight="bold">
            Contribute:
          </Text>
          <Text color="gray.500">
            You can contribute to this project by running the CLI command below.
          </Text>
          {/* @todo right now, the user have to delete the the <YOUR-ENTROPY-HERE> and insert the entropy on the CLI.
              Maybe we could make the user able to input the entropy in different ways in the frontend? (e.g., kzg)
               and then overwrite the <YOUR-ENTROPY-HERE> option to have a one-copy command ready to run. */}
          <Button
            leftIcon={<Box as={FaCopy} w={3} h={3} />}
            variant="outline"
            onClick={copyContribute}
            fontSize={12}
            fontWeight={"regular"}
          >
            {copiedContribute
              ? "Copied"
              : `> phase2cli contribute 
             `}
          </Button>
        </VStack>
        <VStack align="start" spacing={2} py={2} alignSelf={"stretch"}>
          <HStack
            spacing={1}
            alignSelf={"stretch"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
            flexWrap={"wrap"}
          >
            <Badge
              px={2}
              py={1}
              colorScheme={project.ceremony.data.timeoutMechanismType ? "green" : "gray"}
            >
              {project.ceremony.data.timeoutMechanismType ? "Fixed" : "Flexible"}
            </Badge>
            <Badge px={2} py={1} colorScheme="blue">
              Penalty: {project.ceremony.data.penalty}
            </Badge>
            <Badge px={2} py={1} colorScheme="green">
              {project.ceremony.data.state}
            </Badge>
            <Badge px={2} py={1} colorScheme="red">
              {project.ceremony.data.type}
            </Badge>
            <Badge px={2} py={1} colorScheme="purple">
              {truncateString(project.ceremony.uid, 5)}
            </Badge>
          </HStack>
        </VStack>
      </VStack>

      <VStack
        minH={[null, null, "100vh"]}
        margin="auto"
        maxW={["390px", "390px", "100%"]}
        minW={["390px", "390px", null]}
        p={8}
        alignSelf={"stretch"}
        flexGrow={1}
        justifyContent={"flex-start"}
      >
        <Tabs alignSelf={"stretch"}>
          <TabList alignSelf={"stretch"} justifyContent={"space-evenly"}>
            <Tab fontSize={12}>Live Stats</Tab>
            <Tab fontSize={12}>Contributions</Tab>
            <Tab fontSize={12}>Details</Tab>

            <Tab fontSize={12}>Download ZKey</Tab>
          </TabList>

          <TabPanels py={4}>
            <TabPanel>
              <Box alignItems="center"  alignSelf={"stretch"} w="full">
                <SimpleGrid  alignSelf={"stretch"} maxW={["392px", "390px", "100%"]} columns={1} spacing={6}>
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
                      <SimpleGrid  columns={[2, 2]} spacing={6}>
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
            </TabPanel>
            <TabPanel alignSelf={"stretch"}>
              <HStack justifyContent={"space-between"} alignSelf={"stretch"}>
                <Heading fontSize="18" mb={6} fontWeight={"bold"} letterSpacing={"3%"}>
                  Contributions
                </Heading>
                <Spacer />
              </HStack>
              <Box overflowX="auto">
                <Table fontSize={12} variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Doc</Th>
                      <Th>Contribution Date</Th>
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
                          <Tooltip
                            label={contribution.lastZkeyBlake2bHash}
                            aria-label="Last Zkey Hash"
                          >
                            <Tag fontSize={12}>{contribution.lastZkeyBlake2bHash}</Tag>
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
            <TabPanel>
              <VStack
                alignSelf={"stretch"}
                alignItems={"center"}
                justifyContent={"center"}
                spacing={8}
                py={0}
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
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex accusantium odio
                  corrupti nihil nostrum? Beatae ducimus consequuntur magni quaerat totam corrupti
                  cum, amet maxime nesciunt? Laudantium officia iste quo id.
                </Text>
                <Text textAlign={"center"} fontWeight={"600"} fontSize={"18px"} maxW="30ch">
                  {" "}
                  Search for ceremonies, contribute your entropy to the system.
                </Text>
                <Text textAlign={"center"} fontWeight={"500"} fontSize={"12px"} maxW="50ch">
                  {" "}
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex accusantium odio
                  corrupti nihil nostrum? Beatae ducimus consequuntur magni quaerat totam corrupti
                  cum, amet maxime nesciunt? Laudantium officia iste quo id.
                </Text>
              </VStack>
            </TabPanel>

            <TabPanel>
              <Text fontSize={12} fontWeight="bold">
                Download Final ZKey:
              </Text>
              <Text color="gray.500">
                Use the command below to download the final ZKey file from the S3 bucket.
              </Text>
              <Button
                leftIcon={<Box as={FaCloudDownloadAlt} w={3} h={3} />}
                fontSize={12}
                variant="outline"
                onClick={downloadFileFromS3}
                fontWeight={"regular"}
                isDisabled={project.ceremony.data.state !== CeremonyState.FINALIZED ? true : false}
              >
                Download From S3
              </Button>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </HStack>
  );
};

export default ProjectPage;
