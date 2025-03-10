import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  Heading,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";

import {
  truncateString,
  parseRepoRoot
} from "../helpers/utils";

export const CircuitAbout: React.FC = ({ circuit }) => {
  return (
    <Box borderWidth={1} borderRadius="lg" p={4}>
      <Heading fontSize={16} size="md" mb={2}>
        {circuit.name} - {circuit.description}
      </Heading>
      <SimpleGrid columns={[2, 2]} spacing={4}>
        <Flex justify="space-between" align="center">
          <Stat>
            <StatLabel fontSize={12}>Parameters</StatLabel>
            <StatNumber fontSize={16}>
              {
                circuit.template.paramsConfiguration && circuit.template.paramsConfiguration.length > 0 ?
                circuit.template.paramsConfiguration.join(" ") :
                circuit.template.paramConfiguration && circuit.template.paramConfiguration.length > 0 ?
                circuit.template.paramConfiguration.join(" ") :
                "No parameters"
              }
            </StatNumber>
          </Stat>
        </Flex>
        <Stat>
          <StatLabel fontSize={12}>Commit Hash</StatLabel>
          <StatNumber fontSize={16}>
            <a href={`${parseRepoRoot(circuit.template.source)}/tree/${circuit.template.commitHash}`} target="_blank">
              {truncateString(circuit.template.commitHash, 6)}
            </a>
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
        <Stat>
          <StatLabel fontSize={12}>Compiler Version</StatLabel>
          <StatNumber fontSize={16}>
            {circuit.compiler.version}
          </StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
}
