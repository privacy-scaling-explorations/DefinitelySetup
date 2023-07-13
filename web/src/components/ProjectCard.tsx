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
import { Project } from "../context/StateContext";

interface ProjectCardProps {
  project: Project;
}

function getTimeDifference(date: Date): string {
  const currentDate = new Date();
  const differenceInTime = date.getTime() - currentDate.getTime();
  const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));

  if (differenceInDays < 0) {
    return `${Math.abs(differenceInDays)} days ago`;
  } else if (differenceInDays > 0) {
    return `${differenceInDays} days from now`;
  } else {
    return "Today";
  }
}

function parseDate(dateString: number): Date {
  const parsedDate = new Date(dateString);
  return parsedDate;
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${month}.${day}.${year}`;
}
function truncateString(str: string, numCharacters = 5): string {
  if (str.length <= numCharacters * 2) {
    return str;
  }

  const firstPart = str.substr(0, numCharacters);
  const lastPart = str.substr(-numCharacters);

  return `${firstPart}...${lastPart}`;
}
export function ProjectCard({ project }: ProjectCardProps) {
  /// @todo work on multiple circuits.
  /// @todo uncomplete info for mocked fallback circuit data.

  return (
    <Link to={`/projects/${project.ceremony.data.title}`}>
      <VStack align="start" spacing={0} py={3} px={6}  borderBottomWidth="1px"  fontSize={12}>
        {/* Render project information */}
        <VStack align="start" spacing={2} py={2} alignSelf={"stretch"} >
          <Heading fontSize={16} fontWeight="bold">
            {project.ceremony.data.title}
          </Heading>
          <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
            {project.ceremony.data.description}
          </Text>
      
        </VStack>

        <VStack align="start" spacing={2} py={2} alignSelf={"stretch"}>
          <HStack
            spacing={1}
            alignSelf={"stretch"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
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
              {" "}
              {project.ceremony.data.type}
            </Badge>
            <Badge px={2} py={1} colorScheme="purple">
              {" "}
              {truncateString(project.ceremony.uid, 5)}
            </Badge>
          </HStack>

          <Breadcrumb separator="•">
            <BreadcrumbItem>
              <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                {" "}
                 {formatDate(parseDate(project.ceremony.data.startDate))}
              </Text>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                {" "}
                Deadline: {getTimeDifference(parseDate(project.ceremony.data.endDate))}
              </Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </VStack>

        {/* <Text fontSize="sm" fontWeight="bold">
          Params:
        </Text> */}
        {/* <HStack align="start" spacing={1}>
          {circuit.data.template.paramsConfiguration.map((param: any, index: any) => (
            <Tag key={index} size="sm" variant="solid" colorScheme="blue">
              {param}
            </Tag>
          ))}
        </HStack> */}
      </VStack>
    </Link>
  );
}
