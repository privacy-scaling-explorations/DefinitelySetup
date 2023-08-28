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
  SkeletonText,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  Skeleton,
  Stack,
  SkeletonCircle,
  useClipboard,
} from "@chakra-ui/react";
import { StateContext } from "../context/StateContext";
import {
  ProjectData,
  ProjectDataSchema,
  useProjectPageContext
} from "../context/ProjectPageContext";
import { FaCloudDownloadAlt, FaCopy } from "react-icons/fa";
import { CeremonyState } from "../helpers/interfaces";
import { FiTarget, FiZap, FiEye, FiUser, FiMapPin, FiWifi } from "react-icons/fi";
import {
  bytesToMegabytes,
  formatDate,
  getTimeDifference,
  parseDate,
  singleProjectPageSteps,
  truncateString
} from "../helpers/utils";
import Joyride, { STATUS } from "react-joyride";
import ScrollingAvatars from "../components/Avatars";
import { Contribution } from "../components/Contribution";
import { maxConstraintsForBrowser } from "../helpers/constants";

type RouteParams = {
  ceremonyName: string | undefined;
};

const ProjectPage: React.FC = () => {
  const { ceremonyName } = useParams<RouteParams>();
  const { projects, setRunTutorial, runTutorial } = useContext(StateContext);
  const { hasUserContributed, projectData, isLoading, avatars, largestCircuitConstraints } = useProjectPageContext();

  const user = localStorage.getItem("username");
  // handle the callback from joyride
  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRunTutorial(false);
    }
  };

  // find a project with the given ceremony name
  const project = projects.find((p) => p.ceremony.data.title === ceremonyName);

  // Validate the project data against the schema
  const validatedProjectData: ProjectData = ProjectDataSchema.parse(projectData);

  /// @todo work on multiple circuits.
  /// @todo uncomplete info for mocked fallback circuit data.

  const circuitsClean =
    validatedProjectData.circuits?.map((circuit) => ({
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
    })) ?? [];

  const contributionsClean =
    validatedProjectData.contributions?.map((contribution) => ({
      doc: contribution.data.files?.lastZkeyFilename ?? "",
      verificationComputationTime: contribution.data?.verificationComputationTime ?? "",
      valid: contribution.data?.valid ?? false,
      lastUpdated: parseDate(contribution.data?.lastUpdated ?? ""),
      lastZkeyBlake2bHash: truncateString(contribution.data?.files?.lastZkeyBlake2bHash ?? "", 10),
      transcriptBlake2bHash: truncateString(
        contribution.data?.files?.transcriptBlake2bHash ?? "",
        10
      )
    })) ?? [];

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
  const contributeCommand =
    !project || isLoading
      ? ""
      : `phase2cli auth && phase2cli contribute -c ${project?.ceremony.data.prefix}`;
  const installCommand = `npm install -g @p0tion/phase2cli`;
  const authCommand = `phase2cli auth`;
  const zKeyFilename = !circuit || isLoading ? "" : `${circuit.data.prefix}_final.zkey`;
  const downloadLink =
    !project || !circuit || isLoading
      ? ""
      : `https://${project?.ceremony.data.prefix}${
          import.meta.env.VITE_CONFIG_CEREMONY_BUCKET_POSTFIX
        }.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/circuits/${
          circuit.data.prefix
        }/contributions/${zKeyFilename}`;
  // Hook for clipboard
  const { onCopy: copyContribute, hasCopied: copiedContribute } = useClipboard(contributeCommand);
  const { onCopy: copyInstall, hasCopied: copiedInstall } = useClipboard(installCommand);
  const { onCopy: copyAuth, hasCopied: copiedAuth } = useClipboard(authCommand);

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
    <>
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
          maxW={["100vw", null, null]}
          alignSelf={"stretch"}
          alignItems="flex-start"
          p={8}
        >
          <VStack alignSelf={"stretch"}>
            {!project?.ceremony.data || isLoading ? (
              <Box padding="6" boxShadow="lg" bg="white">
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
              </Box>
            ) : (
              <>
                <Joyride
                  callback={handleJoyrideCallback}
                  continuous
                  run={runTutorial}
                  scrollToFirstStep
                  showProgress
                  showSkipButton
                  steps={singleProjectPageSteps}
                  styles={{
                    options: {
                      arrowColor: "red",
                      backgroundColor: "white",
                      overlayColor: "rgba(79, 26, 0, 0.4)",
                      primaryColor: "red",
                      textColor: "black",
                      width: "500px",
                      zIndex: 1000
                    }
                  }}
                />
                <Heading fontSize={16} fontWeight="bold">
                  {project?.ceremony.data.title}
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
                <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                  {project.ceremony.data.description}
                </Text>
                <VStack
                  className="contributeCopyButton"
                  // align="start"
                  spacing={2}
                  py={2}
                  alignSelf={"stretch"}
                >
                  {
                    user && !hasUserContributed && largestCircuitConstraints < maxConstraintsForBrowser ?
                      <Contribution ceremonyId={project.ceremony.uid} /> :
                      hasUserContributed ?
                      <Text fontSize={12} fontWeight="bold">
                        You have already contributed to this ceremony. Thank you for your participation.
                      </Text> :
                      <>
                        <Text color="gray.500">
                          You can contribute to this project by running the CLI commands below.
                        </Text>
                      
                        <Button 
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          fontSize={12}
                          fontWeight={"regular"}
                          onClick={copyInstall}
                        >
                          {
                            copiedInstall ?
                            "Copied"
                            : `> npm install -g @p0tion/phase2cli`
                          }
                        </Button>
                        <Button 
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          fontSize={12}
                          fontWeight={"regular"}
                          onClick={copyAuth}
                        >
                          {
                            copiedAuth ?
                            "Copied"
                            : `> phase2cli auth`
                          }
                        </Button>
                        <Button
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          onClick={copyContribute}
                          fontSize={12}
                          fontWeight={"regular"}
                        >
                          {copiedContribute
                            ? "Copied"
                            : `> phase2cli contribute`
                          }
                        </Button>
                    </>  
                  }
                </VStack>
                <VStack spacing={2} py={2} alignSelf={"stretch"}>
                  <HStack
                    spacing={1}
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
              </>
            )}
            <VStack alignSelf={"stretch"}> 
              <ScrollingAvatars images={avatars}/>
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
                  <Tab className="circuitsView" fontSize={12}>
                    Live Stats
                  </Tab>
                  <Tab className="contributionsButton" fontSize={12}>
                    Contributions
                  </Tab>
                  <Tab className="detailsButton" fontSize={12}>
                    Details
                  </Tab>
                  <Tab className="zKeyNavigationButton" fontSize={12}>
                    Download ZKey
                  </Tab>
                </TabList>

                <TabPanels py={4}>
                  <TabPanel>
                    <Box alignItems="center" alignSelf={"stretch"} w="full">
                      <SimpleGrid
                        alignSelf={"stretch"}
                        maxW={["392px", "390px", "100%"]}
                        columns={1}
                        spacing={6}
                      >
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
                                  <StatNumber fontSize={16}>
                                    {circuit.completedContributions}
                                  </StatNumber>
                                </Stat>
                              </Flex>
                              <Stat>
                                <StatLabel fontSize={12}>Memory Requirement</StatLabel>
                                <StatNumber fontSize={16}>
                                  {circuit.memoryRequirement} mb
                                </StatNumber>
                              </Stat>
                              <Stat>
                                <StatLabel fontSize={12}>Avg Contribution Time</StatLabel>
                                <StatNumber fontSize={16}>
                                  {circuit.avgTimingContribution}s
                                </StatNumber>
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
                      {!contributionsClean || isLoading ? (
                        <Stack>
                          <Skeleton height="20px" />
                          <Skeleton height="20px" />
                          <Skeleton height="20px" />
                        </Stack>
                      ) : (
                        <Table fontSize={12} variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Doc</Th>
                              <Th>Contribution Date</Th>
                              <Th>Hashes</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {contributionsClean.map((contribution, index) => (
                              <Tr key={index}>
                                <Td>{contribution.doc}</Td>
                                <Td>{contribution.lastUpdated}</Td>
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
                      )}
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
                        DefinitelySetup is powered by p0tion, a framework for setting up, managing and contributing to trusted setup ceremonies.
                        You can use this page to view the details of a ceremony, and also to download the final zKey, which will be made available 
                        once the ceremony is finalized. 
                      </Text>
                      <Text textAlign={"center"} fontWeight={"600"} fontSize={"18px"} maxW="30ch">
                        {" "}
                        Search for ceremonies, contribute your entropy to the system.
                      </Text>
                      <Text textAlign={"center"} fontWeight={"500"} fontSize={"12px"} maxW="50ch">
                        {" "}
                        Please note that when circuits have a large number of constraints (you can usually see that when the memory requirements 
                        are greater than 100mb), the contribution might take a long time.
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
                      isDisabled={
                        project?.ceremony.data.state !== CeremonyState.FINALIZED ? true : false
                      }
                    >
                      Download From S3
                    </Button>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
    </>
  );
};

export default ProjectPage;
