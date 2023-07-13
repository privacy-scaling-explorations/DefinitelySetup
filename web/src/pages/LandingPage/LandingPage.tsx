import React, { useContext } from "react";
import { Text } from "@chakra-ui/react";
import { StateContext } from "../../context/StateContext";
import { useLandingPageContext } from "../../context/LandingPageContext";

import { ProjectData, ProjectDataSchema } from "../../context/ProjectPageContext";
import { HeroComponent } from "./HeroComponent";
import SearchResults from "../../components/SearchResults";

const LandingPage: React.FC = () => {
  const { projects, search } = useContext(StateContext);

  const { projectData, isLoading } = useLandingPageContext();


  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const projectId = "A8CVrp2MMx7KO512KFdv"; // aka ceremonyId.
  const project = projects.find((project) => project.ceremony.uid == projectId);

  if (!project || !projectData) {
    return <Text>Error loading project.</Text>;
  }

  // Validate the project data against the schema
  const validatedProjectData: ProjectData = ProjectDataSchema.parse(projectData);
  console.log("validatedProjectData", validatedProjectData);
  // const circuits = validatedProjectData.circuits
  //   ? validatedProjectData.circuits
  //   : {
  //       data: {
  //         fixedTimeWindow: 10,
  //         template: {
  //           source: "todo",
  //           paramsConfiguration: [2, 3, 4]
  //         },
  //         compiler: {
  //           version: "0.5.1",
  //           commitHash: "0xabc"
  //         },
  //         avgTimings: {
  //           fullContribution: 100
  //         },
  //         zKeySizeInBytes: 10,
  //         waitingQueue: {
  //           completedContributions: 0
  //         }
  //       }
  //     };

  const render = search ? (
    <SearchResults />
  ) : (
    <HeroComponent
      project={project}
      circuits={projectData.circuits??[]}
      contributions={projectData.contributions??[]}
    ></HeroComponent>
  );
  return render;
};

export default LandingPage;
