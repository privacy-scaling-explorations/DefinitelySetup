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
  ProjectDataSchema,
  useProjectPageContext
} from "../context/ProjectPageContext";
import { FaCloudDownloadAlt, FaCopy } from "react-icons/fa";
import { CeremonyState, ProjectData } from "../helpers/interfaces";
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
  const { user, projects, setRunTutorial, runTutorial } = useContext(StateContext);
  const { latestZkeys, finalBeacon, finalZkeys, hasUserContributed, projectData, isLoading, avatars, largestCircuitConstraints } = useProjectPageContext();
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

  const circuitsClean =
    validatedProjectData.circuits?.map((circuit) => ({
      template: circuit.data.template,
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

  // parse contributions and sort by zkey name
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
    })).slice().sort((a: any, b: any) => {
      const docA = a.doc.toLowerCase()
      const docB = b.doc.toLowerCase()

      if (docA < docB) return -1
      if (docA > docB) return 1
      return 0
    }) ?? [];

  // Commands
  const contributeCommand =
    !project || isLoading
      ? ""
      : `phase2cli auth && phase2cli contribute -c ${project?.ceremony.data.prefix}`;
  const installCommand = `npm install -g @p0tion/phase2cli`;
  const authCommand = `phase2cli auth`;
  const beaconValue = finalBeacon?.beacon
  const beaconHash = finalBeacon?.beaconHash
 
  // Hook for clipboard
  const { onCopy: copyContribute, hasCopied: copiedContribute } = useClipboard(contributeCommand);
  const { onCopy: copyInstall, hasCopied: copiedInstall } = useClipboard(installCommand);
  const { onCopy: copyAuth, hasCopied: copiedAuth } = useClipboard(authCommand);
  const { onCopy: copyBeaconValue, hasCopied: copiedBeaconValue } = useClipboard(beaconValue || "")
  const { onCopy: copyBeaconHash, hasCopied: copiedBeaconHash } = useClipboard(beaconHash || "")


  // Download a file from AWS S3 bucket.
  const downloadFileFromS3 = (index: number, name: string) => {
    if (finalZkeys) {
      fetch(finalZkeys[index].zkeyURL).then((response) => {
        response.blob().then((blob) => {
          const fileURL = window.URL.createObjectURL(blob);
  
          let alink = document.createElement("a");
          alink.href = fileURL;
          alink.download = name;
          alink.click();
        });
      });
    }
    
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
                  className={
                    user && !hasUserContributed && largestCircuitConstraints < maxConstraintsForBrowser ?
                    "browserContributeCopyButton" :
                    "contributeCopyButton"
                  }
                  // align="start"
                  spacing={2}
                  py={2}
                  alignSelf={"stretch"}
                >
                  {
                    project.ceremony.data.state === CeremonyState.OPENED && user && !hasUserContributed && largestCircuitConstraints < maxConstraintsForBrowser ?
                      <Contribution ceremonyId={project.ceremony.uid} /> :
                      project.ceremony.data.state !== CeremonyState.OPENED ?
                      <Text color="gray.500" fontSize={12} fontWeight="bold">
                        This ceremony is {project.ceremony.data.state.toLocaleLowerCase()}.
                      </Text> :
                      hasUserContributed ?
                      <Text color="gray.500" fontSize={12} fontWeight="bold">
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
            <VStack 
              maxW={["390px", "390px", "100%"]}
              minW={["390px", "390px", null]}
            > 
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
                  <Tab className="linksButton" fontSize={12}>
                    About
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
                            <SimpleGrid columns={[2, 2]} spacing={4}>
                              <Flex justify="space-between" align="center">
                                <Stat>
                                  <StatLabel fontSize={12}>Parameters</StatLabel>
                                  <StatNumber fontSize={16}>
                                    {
                                      circuit.template.paramConfiguration ?
                                      circuit.template.paramConfiguration.join(" ") :
                                      "No parameters"
                                    }
                                  </StatNumber>
                                </Stat>
                              </Flex>
                              <Stat>
                                <StatLabel fontSize={12}>Commit Hash</StatLabel>
                                <StatNumber fontSize={16}>
                                  {truncateString(circuit.template.commitHash, 6)}
                                </StatNumber>
                              </Stat>
                              <Stat>
                                <StatLabel fontSize={12}>Template Link</StatLabel>
                                <StatNumber fontSize={16}>
                                  <a href={circuit.template.source} target="_blank">
                                  {truncateString(circuit.template.source, 16)}
                                  </a>
                                </StatNumber>
                              </Stat>
                            </SimpleGrid>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                      
                    </VStack>
                  </TabPanel>
                  <TabPanel textAlign={"center"}>
                    {
                      project?.ceremony.data.state === CeremonyState.FINALIZED && beaconHash && beaconValue &&
                      <div>
                        <Text fontSize={14} fontWeight="bold">
                        Final contribution beacon
                        </Text>
                        <Button 
                          margin={4}
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          fontSize={12}
                          fontWeight={"regular"}
                          onClick={copyBeaconValue}
                        >
                          {
                            copiedBeaconValue ?
                            "Copied"
                            : `Beacon ${finalBeacon?.beacon}`
                          }
                        </Button>
                        <Button 
                          margin={4}
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          fontSize={12}
                          fontWeight={"regular"}
                          onClick={copyBeaconHash}
                        >
                          {
                            copiedBeaconHash ?
                            "Copied"
                            : `Beacon hash ${truncateString(finalBeacon?.beaconHash)}`
                          }
                        </Button>
                      </div>
                    }
                    <Text p={4} fontSize={14} fontWeight="bold">
                      Download Final ZKey(s)
                    </Text>
                    <Text color="gray.500">
                      Press the button below to download the final ZKey files from the S3 bucket.
                    </Text>
                    {
                      finalZkeys?.map((zkey, index) => {
                        return (
                          <Button
                          margin={"20px"}
                          key={index}
                          leftIcon={<Box as={FaCloudDownloadAlt} w={3} h={3} />}
                          fontSize={12}
                          variant="outline"
                          onClick={() => downloadFileFromS3(index, zkey.zkeyFilename)}
                          fontWeight={"regular"}
                          isDisabled={
                            project?.ceremony.data.state !== CeremonyState.FINALIZED ? true : false
                          }
                        >
                          Download {zkey.zkeyFilename}
                        </Button>
                        )
                      })
                    }
                    {
                      project?.ceremony.data.state === CeremonyState.FINALIZED &&
                      <>
                        <Text p={4} fontSize={14} fontWeight="bold">
                        Download Last ZKey(s)
                        </Text>
                        <Text color="gray.500">
                          You can use this zKey(s) with the beacon value to verify that the final zKey(s) was computed correctly.
                        </Text>
                        {
                          latestZkeys?.map((zkey, index) => {
                            return (
                              <Button
                              margin={"20px"}
                              key={index}
                              leftIcon={<Box as={FaCloudDownloadAlt} w={3} h={3} />}
                              fontSize={12}
                              variant="outline"
                              onClick={() => downloadFileFromS3(index, zkey.zkeyFilename)}
                              fontWeight={"regular"}
                              isDisabled={
                                project?.ceremony.data.state !== CeremonyState.FINALIZED ? true : false
                              }
                            >
                              Download {zkey.zkeyFilename}
                            </Button>
                            )
                          })
                        }
                      </>
                    }
                   
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
