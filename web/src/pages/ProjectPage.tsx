import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Button,
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  SkeletonCircle,
  SkeletonText,
  useClipboard,
} from "@chakra-ui/react";
import { StateContext } from "../context/StateContext";
import { useProjectPageContext } from "../context/ProjectPageContext";
import { FaCopy } from "react-icons/fa";
import { CeremonyState } from "../helpers/interfaces";
import {
  formatDate,
  getTimeDifference,
  singleProjectPageSteps,
  truncateString,
} from "../helpers/utils";
import Joyride, { STATUS } from "react-joyride";
import { ProjectTabStats } from "../components/ProjectTabStats";
import { ProjectTabContributions } from "../components/ProjectTabContributions";
import { ProjectTabAbout } from "../components/ProjectTabAbout";
import { ProjectTabZKey } from "../components/ProjectTabZKey";
import ScrollingAvatars from "../components/Avatars";
import { Contribution } from "../components/Contribution";
import { maxConstraintsForBrowser } from "../helpers/constants";

type RouteParams = {
  ceremonyName: string | undefined;
};

const ProjectPage: React.FC = () => {
  const { ceremonyName } = useParams<RouteParams>();
  const { user, projects, setRunTutorial, runTutorial } = useContext(StateContext);
  const {
    hasUserContributed,
    isLoading,
    largestCircuitConstraints
  } = useProjectPageContext();

  const [project, setProject] = useState(null);
  useEffect(() => {
    // find a project with the given ceremony name
    setProject(projects.find((p) => p.ceremony.data.title === ceremonyName));
  }, [projects]);

  // handle the callback from joyride
  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRunTutorial(false);
    }
  };

  // Commands
  const contributeCommand =
    !project || isLoading
      ? ""
      : `phase2cli auth && phase2cli contribute -c ${project?.ceremony.data.prefix}`;
  const installCommand = `npm install -g @p0tion/phase2cli`;
  const authCommand = `phase2cli auth`;

  // Hook for clipboard
  const { onCopy: copyContribute, hasCopied: copiedContribute } = useClipboard(contributeCommand);
  const { onCopy: copyInstall, hasCopied: copiedInstall } = useClipboard(installCommand);
  const { onCopy: copyAuth, hasCopied: copiedAuth } = useClipboard(authCommand);

  return (
    <>
      <HStack
        fontSize={12}
        minW="375px"
        minH={[null, null, "100vh"]}
        w="100%"
        alignItems="flex-start"
        alignSelf={"stretch"}
        justifyContent={"flex-start"}
        flexWrap={"wrap"}
        spacing={0}
        py={5}
      >
        <VStack
          minH={[null, null, "100vh"]}
          margin="auto"
          maxW={["100vw", null, null]}
          alignSelf={"stretch"}
          alignItems="flex-start"
          p={8}
        >
          <VStack alignSelf={"stretch"}>
            {!project?.ceremony.data || isLoading ? (
              <Box padding="6" boxShadow="lg" bg="white">
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
              </Box>
            ) : (
              <>
                <Joyride
                  callback={handleJoyrideCallback}
                  continuous
                  run={runTutorial}
                  scrollToFirstStep
                  showProgress
                  showSkipButton
                  steps={singleProjectPageSteps}
                  styles={{
                    options: {
                      arrowColor: "red",
                      backgroundColor: "white",
                      overlayColor: "rgba(79, 26, 0, 0.4)",
                      primaryColor: "red",
                      textColor: "black",
                      width: "500px",
                      zIndex: 1000
                    }
                  }}
                />
                <Heading fontSize={16} fontWeight="bold">
                  {project?.ceremony.data.title}
                </Heading>
                <Breadcrumb separator="•">
                  <BreadcrumbItem>
                    <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                      {formatDate(new Date(project.ceremony.data.startDate))}
                    </Text>
                  </BreadcrumbItem>

                  <BreadcrumbItem>
                    <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                      Deadline: {getTimeDifference(new Date(project.ceremony.data.endDate))}
                    </Text>
                  </BreadcrumbItem>
                </Breadcrumb>
                <Text fontSize={12} fontWeight="regular" color={"gray.500"}>
                  {project.ceremony.data.description}
                </Text>
                <VStack
                  className={
                    user && !hasUserContributed && largestCircuitConstraints < maxConstraintsForBrowser ?
                    "browserContributeCopyButton" :
                    "contributeCopyButton"
                  }
                  // align="start"
                  spacing={2}
                  py={2}
                  alignSelf={"stretch"}
                >
                  {
                    project.ceremony.data.state === CeremonyState.OPENED && user && !hasUserContributed && largestCircuitConstraints < maxConstraintsForBrowser ?
                      <Contribution ceremonyId={project.ceremony.uid} /> :
                      project.ceremony.data.state !== CeremonyState.OPENED ?
                      <Text color="gray.500" fontSize={12} fontWeight="bold">
                        This ceremony is {project.ceremony.data.state.toLocaleLowerCase()}.
                      </Text> :
                      hasUserContributed ?
                      <Text color="gray.500" fontSize={12} fontWeight="bold">
                        You have already contributed to this ceremony. Thank you for your participation.
                      </Text> :
                      <>
                        <Text color="gray.500">
                          You can contribute to this project by running the CLI commands below.
                        </Text>
                      
                        <Button 
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          fontSize={12}
                          fontWeight={"regular"}
                          onClick={copyInstall}
                        >
                          {
                            copiedInstall ?
                            "Copied"
                            : `> npm install -g @p0tion/phase2cli`
                          }
                        </Button>
                        <Button 
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          fontSize={12}
                          fontWeight={"regular"}
                          onClick={copyAuth}
                        >
                          {
                            copiedAuth ?
                            "Copied"
                            : `> phase2cli auth`
                          }
                        </Button>
                        <Button
                          leftIcon={<Box as={FaCopy} w={3} h={3} />}
                          variant="outline"
                          onClick={copyContribute}
                          fontSize={12}
                          fontWeight={"regular"}
                        >
                          {copiedContribute
                            ? "Copied"
                            : `> phase2cli contribute`
                          }
                        </Button>
                    </>  
                  }
                </VStack>
                <VStack spacing={2} py={2} alignSelf={"stretch"}>
                  <HStack
                    spacing={1}
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
                      {project.ceremony.data.type}
                    </Badge>
                    <Badge px={2} py={1} colorScheme="purple">
                      {truncateString(project.ceremony.uid, 5)}
                    </Badge>
                  </HStack>
                </VStack>
              </>
            )}
            <VStack 
              maxW={["390px", "390px", "100%"]}
              minW={["390px", "390px", null]}
            > 
              <ScrollingAvatars />
            </VStack>
            <VStack
              minH={[null, null, "100vh"]}
              margin="auto"
              maxW={["390px", "390px", "100%"]}
              minW={["390px", "390px", null]}
              p={8}
              alignSelf={"stretch"}
              flexGrow={1}
              justifyContent={"flex-start"}
            >
              <Tabs alignSelf={"stretch"}>
                <TabList alignSelf={"stretch"} justifyContent={"space-evenly"}>
                  <Tab className="circuitsView" fontSize={12}>
                    Live Stats
                  </Tab>
                  <Tab className="contributionsButton" fontSize={12}>
                    Contributions
                  </Tab>
                  <Tab className="linksButton" fontSize={12}>
                    About
                  </Tab>
                  <Tab className="zKeyNavigationButton" fontSize={12}>
                    Download ZKey
                  </Tab>
                </TabList>

                <TabPanels py={4}>
                  <ProjectTabStats />
                  <ProjectTabContributions />
                  <ProjectTabAbout />
                  <ProjectTabZKey {...{project}} />
                </TabPanels>
              </Tabs>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
    </>
  );
};

export default ProjectPage;
