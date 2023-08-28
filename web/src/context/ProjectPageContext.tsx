import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentData } from "firebase/firestore";
import { z } from "zod";
import { StateContext, useStateContext } from "./StateContext";
import {
  getAllCollectionDocs,
  getCeremonyCircuits,
  getContributions,
  getParticipantsAvatar
} from "../helpers/firebase";
import {
  CircuitDocumentReferenceAndData,
  ParticipantDocumentReferenceAndData
} from "../helpers/interfaces";
import { checkIfUserContributed, findLargestConstraint, processItems } from "../helpers/utils";
import { maxConstraintsForBrowser } from "../helpers/constants";


export const ProjectDataSchema = z.object({
  circuits: z.optional(z.array(z.any())),
  participants: z.optional(z.array(z.any())),
  contributions: z.optional(z.array(z.any()))
});

export type ProjectData = z.infer<typeof ProjectDataSchema>;

export type ProjectPageContextProps = {
  hasUserContributed: boolean;
  projectData: ProjectData | null;
  isLoading: boolean;
  runTutorial: boolean;
  avatars?: string[];
  largestCircuitConstraints: number,
};

export const defaultProjectData: ProjectData = {};

type ProjectPageProviderProps = {
  children: React.ReactNode;
};

const ProjectPageContext = createContext<ProjectPageContextProps>({
  hasUserContributed: false,
  projectData: defaultProjectData,
  isLoading: false,
  runTutorial: false,
  avatars: [],
  largestCircuitConstraints: maxConstraintsForBrowser + 1, // contribution on browser has 100000 max constraints
});

export const useProjectPageContext = () => useContext(ProjectPageContext);

export const ProjectPageProvider: React.FC<ProjectPageProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { loading: isLoading, setLoading: setIsLoading, runTutorial } = useContext(StateContext);
  const [projectData, setProjectData] = useState<ProjectData | null>(defaultProjectData);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [hasUserContributed, setHasUserContributed] = useState<boolean>(false);
  const [largestCircuitConstraints, setLargestCircuitConstraints] = useState<number>(maxConstraintsForBrowser + 1) // contribution on browser has 100000 max constraints

  const { projects } = useStateContext();
  const { ceremonyName } = useParams();

  const project = projects.find((project) => project.ceremony.data.title === ceremonyName);
  const projectId = project?.ceremony.uid || "HmLZ1vjZjhDPU0v3q8kD";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const circuitsDocs = await getCeremonyCircuits(projectId);
        const circuits: CircuitDocumentReferenceAndData[] = circuitsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data }));

        const participantsDocs = await getAllCollectionDocs(`ceremonies/${projectId}/participants`);
        const participants: ParticipantDocumentReferenceAndData[] = participantsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data() }));

        // run concurrent requests per circuit
        const args: any[][] = circuits.map((circuit: CircuitDocumentReferenceAndData) => [projectId, circuit.uid])
        const { results } = await processItems(args, getContributions, true)
        
        const contributions = results.flat()

        const updatedProjectData = { circuits, participants, contributions };
        
        const parsedData = ProjectDataSchema.parse(updatedProjectData);

        setProjectData(parsedData);

        const avatars = await getParticipantsAvatar(projectId)
        setAvatars(avatars)

        const hasContributed = await checkIfUserContributed(projectId)
        setHasUserContributed(hasContributed)

        const _constraints = findLargestConstraint(circuits)
        setLargestCircuitConstraints(_constraints)
      } catch (error) {
        console.error(error);
        navigate("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, projectId]);


  return (
    <ProjectPageContext.Provider value={{ largestCircuitConstraints, hasUserContributed, projectData, isLoading, runTutorial, avatars }}>
      {children}
    </ProjectPageContext.Provider>
  );
};
