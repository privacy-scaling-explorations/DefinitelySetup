import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { StateContext } from "../../context/StateContext";
import { useLandingPageContext } from "../../context/LandingPageContext";

import { ProjectData, ProjectDataSchema } from "../../context/ProjectPageContext";
import { HeroComponent } from "./HeroComponent";
import SearchResults from "../../components/SearchResults";

type RouteParams = {
  ceremonyName: string | undefined;
};

const LandingPage: React.FC = () => {
  const { ceremonyName } = useParams<RouteParams>();
  const { projects, search } = useContext(StateContext);

  const { projectData, isLoading } = useLandingPageContext();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const project = projects.find((p) => p.ceremony.data.title === ceremonyName);

  if (!project || !projectData) {
    return <Text>Error loading project.</Text>;
  }

  // Validate the project data against the schema
  const validatedProjectData: ProjectData = ProjectDataSchema.parse(projectData);
  console.log("validatedProjectData", validatedProjectData);
  const circuit = validatedProjectData.circuits
    ? validatedProjectData.circuits[0]
    : {
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
      };

  const render = search ? (
    <SearchResults />
  ) : (
    <HeroComponent project={project} circuit={circuit}></HeroComponent>
  );
  return render;
};

export default LandingPage;
