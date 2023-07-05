import { Link } from "react-router-dom";
import { VStack, HStack, Text, Box, Tag, Badge, Divider } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { Project } from "../context/StateContext";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.ceremonyName}`}>
      <VStack align="start" spacing={4} p={5} shadow="md" borderWidth="1px">
        {/* Render project information */}
        <Text fontSize="xl" fontWeight="bold">{project.ceremonyName}</Text>
        <Text>{project.description}</Text>
        <Divider />
        <HStack spacing={4}>
          <Badge colorScheme={project.fixed ? "green" : "gray"}>{project.fixed ? "Fixed" : "Flexible"}</Badge>
          <Badge colorScheme="blue">Threshold: {project.threshold}</Badge>
          <Badge colorScheme="blue">Timeout: {project.timeoutThreshold} seconds</Badge>
        </HStack>
        <Divider />
        <HStack>
          <Box as={FaGithub} w={6} h={6} />
          <Text>{project.githubCircomTemplate}</Text>
        </HStack>
        <HStack>
          <Text>Start: {project.startDate}</Text>
          <Text>End: {project.endDate}</Text>
        </HStack>
        <HStack>
          <Text>Circom Version: {project.circomVersion}</Text>
          <Text>Commit Hash: {project.commitHash}</Text>
        </HStack>
        <Divider />
        <Text fontSize="sm" fontWeight="bold">Params:</Text>
        <HStack align="start" spacing={1}>
          {project.paramsArray.map((param, index) => (
            <Tag key={index} size="sm" variant="solid" colorScheme="blue">
              {param}
            </Tag>
          ))}
        </HStack>
      </VStack>
    </Link>
  );
}
