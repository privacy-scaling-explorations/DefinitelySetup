import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Divider,
  Badge,
  Link,
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
  Grid
} from "@chakra-ui/react";
import { StateContext } from "../context/StateContext";
import {
  useProjectPageContext
} from "../context/ProjectPageContext";
import { FaGithub, FaCloudDownloadAlt, FaClipboard } from "react-icons/fa";

type RouteParams = {
  ceremonyName: string | undefined;
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
  // const validatedProjectData: ProjectData = ProjectDataSchema.parse(projectData);

  // Commands
  const contributeCommand = `phase2cli contribute ${project.ceremony.data.title}`;
  const downloadCommand = `aws s3 cp s3://yourbucket/zkey/${project.ceremony.data.title}`; // replace with your S3 bucket and file path

  // Hook for clipboard   
  const { onCopy: copyContribute, hasCopied: copiedContribute } = useClipboard(contributeCommand);
  const { onCopy: copyDownload, hasCopied: copiedDownload } = useClipboard(downloadCommand);

  return (
    <VStack spacing={4} align="start" p={8}>
      {/* Render project information from StateContext */}
      <HStack w="100%" justifyContent={"space-between"}>
        <Text fontSize="2xl" fontWeight="bold">
          {project.ceremony.data.title}
        </Text>{" "}
      </HStack>

      <Text>{project.ceremony.data.description}</Text>
      <Divider />
      <HStack spacing={4}>
        <Badge colorScheme={project.ceremony.data.timeoutMechanismType ? "green" : "gray"}>
          {project.ceremony.data.timeoutMechanismType ? "Fixed" : "Flexible"}
        </Badge>
        <Badge colorScheme="blue">Penalty: {project.ceremony.data.penalty}</Badge>
        {/* @todo this is a circuit info */}
        {/* <Badge colorScheme="blue">Timeout: {project.ceremony.} seconds</Badge> */}
      </HStack>
      <Divider />
      <HStack>
        <Box as={FaGithub} w={6} h={6} />
        {/* @todo this is a circuit info */}
        <Link
          href={`https://placeholder`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* {project.githubCircomTemplate} */}
        </Link>
      </HStack>
      <Divider />
      {/* @todo this is a circuit info */}
      {/* <Text fontSize="sm" fontWeight="bold">
          Params:
        </Text>
        <HStack align="start" spacing={1}>
          {project.paramsArray.map((param, index) => (
            <Tag key={index} size="sm" variant="solid" colorScheme="blue">
              {param}
            </Tag>
          ))}
        </HStack> */}
      <Tabs>
        <TabList>
          <Tab>Contribute</Tab>
          <Tab>Ceremony Configuration</Tab>
          <Tab>Live Data</Tab>

          <Tab>Download ZKey</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Text fontSize="lg" fontWeight="bold">
              Contribute:
            </Text>
            <Text color="gray.500">
              You can contribute to this project by running the command below.
            </Text>
            <Button
              leftIcon={<Box as={FaClipboard} w={3} h={3} />}
              variant="outline"
              onClick={copyContribute}
              fontWeight={"regular"}
            >
              {copiedContribute ? "Copied" : `phase2cli contribute ${project.ceremony.data.title}`}
            </Button>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
              <VStack spacing={0} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
                <Text fontSize="lg" fontWeight="bold">
                  Ceremony Configuration:
                </Text>
                <Text color="gray.500">
                  These are the main configuration parameters for the ceremony.
                </Text>
              </VStack>

              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <Stat>
                  <StatLabel>Start Date</StatLabel>
                  <StatNumber>{project.ceremony.data.startDate}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>End Date</StatLabel>
                  <StatNumber>{project.ceremony.data.endDate}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Circom Version</StatLabel>
                  {/* @todo this is a circuit info */}
                  {/* <StatNumber>{project.circomVersion}</StatNumber> */}
                </Stat>
                <Stat>
                  <StatLabel>Commit Hash</StatLabel>
                  {/* @todo this is a circuit info */}
                  {/* <StatNumber>{project.commitHash}</StatNumber> */}
                </Stat>
              </Grid>
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
              <VStack spacing={0} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
                <Text fontSize="lg" fontWeight="bold">
                  Live Data:
                </Text>
                <Text color="gray.500">Real-time data related to the project.</Text>
              </VStack>
              <Grid templateColumns="repeat(2, 1fr)" gap={8} w="full">
                <Stat>
                  <StatLabel>Average Contribution Time</StatLabel>
                  {/* @todo this is a circuit info */}
                  {/* <StatNumber>{validatedProjectData.avgContributionTime}</StatNumber> */}
                </Stat>
                <Stat>
                  <StatLabel>Disk Space Required</StatLabel>
                  {/* @todo this is a circuit info */}
                  <StatNumber>
                    {/* {validatedProjectData.diskSpaceRequired} {validatedProjectData.diskSpaceUnit} */}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Last Contributor ID</StatLabel>
                  {/* @todo this is a circuit info */}
                  {/* <StatNumber>{validatedProjectData.lastContributorId}</StatNumber> */}
                </Stat>
                <Stat>
                  <StatLabel>ZKey Index</StatLabel>
                  {/* @todo this is a circuit info */}
                  {/* <StatNumber>{validatedProjectData.zKeyIndex}</StatNumber> */}
                </Stat>
              </Grid>
            </VStack>
          </TabPanel>

          <TabPanel>
            <Text fontSize="lg" fontWeight="bold">
              Download ZKey:
            </Text>
            <Text color="gray.500">
              Use the command below to download the ZKey files from the S3 bucket.
            </Text>
            <Button
              leftIcon={<Box as={FaCloudDownloadAlt} w={3} h={3} />}
              variant="outline"
              onClick={copyDownload}
              fontWeight={"regular"}
            >
              {copiedDownload ? "Copied" : ` ${downloadCommand}`}
            </Button>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default ProjectPage;
