
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
  TabPanel, Stat,
  StatLabel,
  StatNumber,
  Grid,
  Tag,
  Heading
} from "@chakra-ui/react";
import { Project } from "../../context/StateContext";
import { FaGithub } from "react-icons/fa";
import { truncateString, parseDate } from "./truncateString";

interface HeroComponentProps {
  project: Project, circuit: any
}

export function HeroComponent({ project, circuit }: HeroComponentProps) {
  return <VStack
    fontSize={12}
    minW="375px"
    align="start"
    spacing={4}
    p={5}
    mx={8}
    shadow="md"
    borderWidth="1px"
  >
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
      <Text>{truncateString(circuit.data.template.source, 25)}</Text>
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
      <Tabs>
        <TabList>

          <Tab fontSize={12}>Ceremony Configuration</Tab>
          <Tab fontSize={12}>Live Data</Tab>

        </TabList>

        <TabPanels>

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

              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <Stat>
                  <StatLabel fontSize={12}>Start Date</StatLabel>
                  <StatNumber fontSize={16}>
                    {parseDate(project.ceremony.data.startDate)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize={12}>End Date</StatLabel>
                  <StatNumber fontSize={16}>
                    {parseDate(project.ceremony.data.endDate)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize={12}>Circom Version</StatLabel>
                  <StatNumber fontSize={16}>{circuit.data.compiler.version}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize={12}>Commit Hash</StatLabel>
                  <StatNumber fontSize={16}>
                    {truncateString(circuit.data.compiler.commitHash)}
                  </StatNumber>
                </Stat>
              </Grid>
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
              <VStack spacing={0} w="full" alignItems={"flex-start"} alignSelf={"stretch"}>
                <Text fontSize={12} fontWeight="bold">
                  Live Data:
                </Text>
                <Text color="gray.500">Real-time data related to the project.</Text>
              </VStack>
              <Grid templateColumns="repeat(2, 1fr)" gap={8} w="full">
                <Stat>
                  <StatLabel fontSize={12}>Average Contribution Time</StatLabel>
                  <StatNumber fontSize={16}>
                    {circuit.data.avgTimings?.fullContribution}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize={12}>Disk Space Required</StatLabel>
                  <StatNumber fontSize={16}>
                    {circuit.data.zKeySizeInBytes} {"Bytes"}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize={12}>Last Contributor ID</StatLabel>
                  <StatNumber fontSize={16}>
                    {circuit.data.waitingQueue?.completedContributions! > 0
                      ? "do something on contribution to retrieve..."
                      : "nobody"}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize={12}>ZKey Index</StatLabel>
                  <StatNumber fontSize={16}>
                    {circuit.data.waitingQueue?.completedContributions! + 1}
                  </StatNumber>
                </Stat>
              </Grid>
            </VStack>
          </TabPanel>


        </TabPanels>
      </Tabs>
    </VStack>
  </VStack>;
}
