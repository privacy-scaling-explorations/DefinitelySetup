import { Link } from "react-router-dom";

import {
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  Breadcrumb,
  BreadcrumbItem
} from "@chakra-ui/react";

import { Project } from "../helpers/interfaces";


interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Format a date to the form "mm.dd.yy"
  const formatDate = (date: Date): string => 
    `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}.${String(date.getFullYear()).slice(-2)}`;

  // Return a truncated string with the start and end, and an ellipsis in the middle
  const truncateString = (str: string, numCharacters = 5): string => 
    str.length <= numCharacters * 2 ? str : `${str.slice(0, numCharacters)}...${str.slice(-numCharacters)}`;

  // Get a human-readable string indicating how far in the future or past a date is
  const getTimeDifference = (date: Date): string => {
    const currentDate = new Date();
    const differenceInTime = date.getTime() - currentDate.getTime();
    const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays < 0) return `${Math.abs(differenceInDays)} days ago`;
    if (differenceInDays > 0) return `${differenceInDays} days from now`;
    return "Today";
  };

  return (
    <Link to={`/projects/${project.ceremony.data.title}`}>
      <VStack align="start" spacing={0} py={3} px={6} borderBottomWidth="1px" fontSize={12}>
        <VStack align="start" spacing={2} py={2} alignSelf={"stretch"}>
          <Heading fontSize={16} fontWeight="bold">{project.ceremony.data.title}</Heading>
          <Text fontSize={12} fontWeight="regular" color={"gray.500"}>{project.ceremony.data.description}</Text>
        </VStack>

        <VStack align="start" spacing={2} py={2} alignSelf={"stretch"}>
          <HStack
            spacing={1}
            alignSelf={"stretch"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
            flexWrap={"wrap"}
          >
            <Badge px={2} py={1} colorScheme={project.ceremony.data.timeoutMechanismType ? "green" : "gray"}>
              {project.ceremony.data.timeoutMechanismType ? "Fixed" : "Flexible"}
            </Badge>
            <Badge px={2} py={1} colorScheme="blue">Penalty: {project.ceremony.data.penalty}</Badge>
            <Badge px={2} py={1} colorScheme="green">{project.ceremony.data.state}</Badge>
            <Badge px={2} py={1} colorScheme="red">{project.ceremony.data.type}</Badge>
            <Badge px={2} py={1} colorScheme="purple">{truncateString(project.ceremony.uid, 5)}</Badge>
          </HStack>

          <Breadcrumb separator="•">
            <BreadcrumbItem>
              <Text fontSize={12} fontWeight="regular" color={"gray.500"}>{formatDate(new Date(project.ceremony.data.startDate))}</Text>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <Text fontSize={12} fontWeight="regular" color={"gray.500"}>Deadline: {getTimeDifference(new Date(project.ceremony.data.endDate))}</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </VStack>
      </VStack>
    </Link>

  );
}
