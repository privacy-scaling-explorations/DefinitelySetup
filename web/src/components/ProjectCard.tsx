import { Link } from "react-router-dom";
import { VStack, HStack, Text, Box, Badge, Divider } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { Project } from "../context/StateContext";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  console.log(project)
  return (
    <Link to={`/projects/${project.ceremony.data.title}`}>
      <VStack align="start" spacing={4} p={5} shadow="md" borderWidth="1px">
        {/* Render project information */}
        <Text fontSize="xl" fontWeight="bold">
          {project.ceremony.data.title}
        </Text>
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
          <Text>No</Text>
          {/* @todo this is a circuit info */}
          {/* <Text>{project.githubCircomTemplate}</Text> */}
        </HStack>
        <HStack>
          <Text>Start: {project.ceremony.data.startDate}</Text>
          <Text>End: {project.ceremony.data.endDate}</Text>
        </HStack>
        <HStack>
          {/* @todo this is a circuit info */}
          {/* <Text>Circom Version: {project.circomVersion}</Text>
          <Text>Commit Hash: {project.commitHash}</Text> */}
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
    </VStack>
    </Link >
  );
}
