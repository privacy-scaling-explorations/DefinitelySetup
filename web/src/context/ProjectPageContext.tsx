import { createContext, useContext, useEffect, useState } from "react";
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
import { processItems } from "../helpers/utils";


export const ProjectDataSchema = z.object({
  circuits: z.optional(z.array(z.any())),
  participants: z.optional(z.array(z.any())),
  contributions: z.optional(z.array(z.any()))
});

export type ProjectData = z.infer<typeof ProjectDataSchema>;

export type ProjectPageContextProps = {
  projectData: ProjectData | null;
  isLoading: boolean;
  runTutorial: boolean;
  avatars?: string[];
};

export const defaultProjectData: ProjectData = {};

type ProjectPageProviderProps = {
  children: React.ReactNode;
};

const ProjectPageContext = createContext<ProjectPageContextProps>({
  projectData: defaultProjectData,
  isLoading: false,
  runTutorial: false,
  avatars: []
});

export const useProjectPageContext = () => useContext(ProjectPageContext);

export const ProjectPageProvider: React.FC<ProjectPageProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { loading: isLoading, setLoading: setIsLoading, runTutorial } = useContext(StateContext);
  const [projectData, setProjectData] = useState<ProjectData | null>(defaultProjectData);
  const [avatars, setAvatars] = useState<string[]>([]);

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
        // @todo handle errors? const { results, errors } = ...
        const { results } = await processItems(args, getContributions, true)
        
        const contributions = results.flat()

        const updatedProjectData = { circuits, participants, contributions };
        
        const parsedData = ProjectDataSchema.parse(updatedProjectData);

        setProjectData(parsedData);

        const avatars = await getParticipantsAvatar(projectId)
        console.log(avatars)
        setAvatars(avatars)
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
    <ProjectPageContext.Provider value={{ projectData, isLoading, runTutorial, avatars }}>
      {children}
    </ProjectPageContext.Provider>
  );
};
