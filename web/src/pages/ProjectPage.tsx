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
  Tag,
  TagLeftIcon,
  Stat,
  StatLabel,
  StatNumber,
  Grid
} from "@chakra-ui/react";
import { StateContext } from "../context/StateContext";
import {
  useProjectPageContext,
  ProjectData,
  ProjectDataSchema
} from "../context/ProjectPageContext";
import { FaGithub, FaTag, FaCloudDownloadAlt, FaClipboard } from "react-icons/fa";

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

  const project = projects.find((p) => p.ceremonyName === ceremonyName);

  if (!project || !projectData) {
    return <Text>Error loading project.</Text>;
  }

  // Validate the project data against the schema
  const validatedProjectData: ProjectData = ProjectDataSchema.parse(projectData);

  // Commands
  const contributeCommand = `phase2cli contribute ${project.ceremonyName}`;
  const downloadCommand = `aws s3 cp s3://yourbucket/zkey/${project.ceremonyName}`; // replace with your S3 bucket and file path

  // Hook for clipboard
  const { onCopy: copyContribute, hasCopied: copiedContribute } = useClipboard(contributeCommand);
  const { onCopy: copyDownload, hasCopied: copiedDownload } = useClipboard(downloadCommand);

  return (
    <VStack spacing={4} align="start" p={8} w="full" >
      {/* Render project information from StateContext */}
      <HStack justifyContent={"space-between"}>
        <Text fontSize="2xl" fontWeight="bold">
          {project.ceremonyName}
        </Text>{" "}
      </HStack>

      <Text>{project.description}</Text>
      <Divider />
      <HStack spacing={4}>
        <Badge colorScheme={project.fixed ? "green" : "gray"}>
          {project.fixed ? "Fixed" : "Flexible"}
        </Badge>
        <Badge colorScheme="blue">Threshold: {project.threshold}</Badge>
        <Badge colorScheme="blue">Timeout: {project.timeoutThreshold} seconds</Badge>
      </HStack>
      <Divider />
      <HStack>
        <Box as={FaGithub} w={6} h={6} />
        <Link
          href={`https://${project.githubCircomTemplate}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {project.githubCircomTemplate}
        </Link>
      </HStack>
      <Divider />
      <HStack align="start" spacing={1}>
        {project.paramsArray.map((param, index) => (
          <Tag key={index} size="sm" variant="solid" colorScheme="blue">
            <TagLeftIcon boxSize="12px" as={FaTag} />
            {param}
          </Tag>
        ))}
      </HStack>
      <VStack maxW="700px" w="100%" marginX={"auto"}>

  
      <Tabs>
        <TabList>
          <Tab>Contribute</Tab>
          <Tab>Ceremony Configuration</Tab>
          <Tab>Live Data</Tab>

          <Tab>Download ZKey</Tab>
        </TabList>

        <TabPanels >
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
              {copiedContribute ? "Copied" : `phase2cli contribute ${project.ceremonyName}`}
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
                  <StatNumber>{project.startDate}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>End Date</StatLabel>
                  <StatNumber>{project.endDate}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Circom Version</StatLabel>
                  <StatNumber>{project.circomVersion}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Commit Hash</StatLabel>
                  <StatNumber>{project.commitHash}</StatNumber>
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
                  <StatNumber>{validatedProjectData.avgContributionTime}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Disk Space Required</StatLabel>
                  <StatNumber>
                    {validatedProjectData.diskSpaceRequired} {validatedProjectData.diskSpaceUnit}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Last Contributor ID</StatLabel>
                  <StatNumber>{validatedProjectData.lastContributorId}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>ZKey Index</StatLabel>
                  <StatNumber>{validatedProjectData.zKeyIndex}</StatNumber>
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
    </VStack>
  );
};

export default ProjectPage;
