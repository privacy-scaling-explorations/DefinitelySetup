import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Divider,
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
  Grid,
  Tag,
  Heading
} from "@chakra-ui/react";
import { StateContext } from "../context/StateContext";
import {
  ProjectData,
  ProjectDataSchema,
  useProjectPageContext
} from "../context/ProjectPageContext";
import { FaGithub, FaCloudDownloadAlt, FaClipboard } from "react-icons/fa";
import { CeremonyState } from "../helpers/interfaces";

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
console.log("validatedProjectData",validatedProjectData)
  /// @todo work on multiple circuits.
  /// @todo uncomplete info for mocked fallback circuit data.
  const circuit = validatedProjectData.circuits ? validatedProjectData.circuits[0] : {
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
  }

  // Commands
  const contributeCommand = `phase2cli auth && phase2cli contribute -c ${project.ceremony.data.prefix}`;
  const zKeyFilename = `${circuit.data.prefix}_final.zkey`
  const downloadLink = `https://${project.ceremony.data.prefix}${import.meta.env.VITE_CONFIG_CEREMONY_BUCKET_POSTFIX}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/circuits/${circuit.data.prefix}/contributions/${zKeyFilename}`;
  // Hook for clipboard   
  const { onCopy: copyContribute, hasCopied: copiedContribute } = useClipboard(contributeCommand);

  /// @todo with a bit of refactor, could be used everywhere for downloading files from S3.
  // Download a file from AWS S3 bucket.
  const downloadFileFromS3 = () => {
    fetch(downloadLink).then(response => {
      response.blob().then(blob => {
        const fileURL = window.URL.createObjectURL(blob);

        let alink = document.createElement('a');
        alink.href = fileURL;
        alink.download = zKeyFilename;
        alink.click();
      })
    })
  }

  return (
 
    <VStack  fontSize={12}minW="375px" align="start" spacing={4} p={5} mx={8} shadow="md" borderWidth="1px">
      {/* Render project information */}
      <Heading fontSize={14} fontWeight="bold">
        {project.ceremony.data.title}
      </Heading>
      <Text>{project.ceremony.data.description}</Text>
      <Divider />
      <HStack spacing={4}>
        <Badge colorScheme={project.ceremony.data.timeoutMechanismType ? "green" : "gray"}>
          {project.ceremony.data.timeoutMechanismType ? "Fixed" : "Flexible"}
        </Badge>
        <Badge colorScheme="blue">Penalty: {project.ceremony.data.penalty}</Badge>
        <Badge colorScheme="blue">Timeout: {circuit.data.fixedTimeWindow} seconds</Badge>
      </HStack>
      <Divider />
      <HStack>
        <Box as={FaGithub} w={6} h={6} />
        <Text>{truncateString(circuit.data.template.source,25)}</Text>
      </HStack>
      <HStack>
        <Text>Start: {parseDate(project.ceremony.data.startDate)}</Text>
        <Text>End: {parseDate(project.ceremony.data.endDate)}</Text>
      </HStack>
      <HStack>
        <Text>Circom Version: {circuit.data.compiler.version}</Text>
        <Text>Commit Hash: {truncateString(circuit.data.compiler.commitHash)}</Text>
      </HStack>
      <Divider />
      <Text fontSize={12} fontWeight="bold">
        Params:
      </Text>
      <HStack align="start" spacing={1}>
        {circuit.data.template.paramsConfiguration?.map((param: any, index: any) => (
          <Tag key={index} size="sm" variant="solid" colorScheme="blue">
            {param}
          </Tag>
        ))}
      </HStack>
      <VStack maxW="700px" w="100%" marginX={"auto"}>

        <Tabs >
          <TabList >
            <Tab fontSize={12}  >Contribute</Tab>
            <Tab fontSize={12} >Ceremony Configuration</Tab>
            <Tab fontSize={12} >Live Data</Tab>

            <Tab fontSize={12} >Download ZKey</Tab>
          </TabList>

          <TabPanels >
            <TabPanel>
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
                leftIcon={<Box as={FaClipboard} w={3} h={3} />}
                variant="outline"
                onClick={copyContribute}
                fontSize={12} 
                fontWeight={"regular"}
              >
                {copiedContribute ? "Copied" : `phase2cli auth && phase2cli contribute ...`}
              </Button>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
                <VStack spacing={0} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
                  <Text fontSize={12} fontWeight="bold">
                    Ceremony Configuration:
                  </Text>
                  <Text color="gray.500">
                    These are the main configuration parameters for the ceremony.
                  </Text>
                </VStack>

                <Grid templateColumns="repeat(2, 1fr)" gap={6} >
                  <Stat>
                    <StatLabel fontSize={12} >Start Date</StatLabel>
                    <StatNumber fontSize={16} >{parseDate(project.ceremony.data.startDate)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize={12}>End Date</StatLabel>
                    <StatNumber fontSize={16}>{ parseDate(project.ceremony.data.endDate)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize={12}>Circom Version</StatLabel>
                    <StatNumber fontSize={16}>{circuit.data.compiler.version}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize={12}>Commit Hash</StatLabel>
                    <StatNumber fontSize={16}>{truncateString(circuit.data.compiler.commitHash)}</StatNumber>
                  </Stat>
                </Grid>
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
                <VStack spacing={0} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
                  <Text fontSize={12}  fontWeight="bold">
                    Live Data:
                  </Text>
                  <Text color="gray.500">Real-time data related to the project.</Text>
                </VStack>
                <Grid templateColumns="repeat(2, 1fr)" gap={8} w="full">
                  <Stat>
                    <StatLabel fontSize={12}>Average Contribution Time</StatLabel>
                    <StatNumber fontSize={16}>{circuit.data.avgTimings?.fullContribution}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize={12}>Disk Space Required</StatLabel>
                    <StatNumber fontSize={16}>
                      {circuit.data.zKeySizeInBytes} {"Bytes"}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize={12}>Last Contributor ID</StatLabel>
                    <StatNumber fontSize={16}>{circuit.data.waitingQueue?.completedContributions! > 0 ? "do something on contribution to retrieve..." : "nobody"}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize={12} >ZKey Index</StatLabel>
                    <StatNumber fontSize={16} >{circuit.data.waitingQueue?.completedContributions! + 1}</StatNumber>
                  </Stat>
                </Grid>
              </VStack>
            </TabPanel>

            <TabPanel>
              <Text fontSize={12}  fontWeight="bold">
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
    </VStack>
  );
};

export default ProjectPage