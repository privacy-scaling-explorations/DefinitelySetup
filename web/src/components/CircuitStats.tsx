import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Heading,
  Flex,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiTarget, FiZap, FiEye, FiUser, FiMapPin, FiWifi } from "react-icons/fi";

export const CircuitStats: React.FC = ({ circuit }) => {
  return (
    <Box borderWidth={1} borderRadius="lg" p={4}>
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
  );
}
