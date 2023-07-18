import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentData } from "firebase/firestore";
import { z } from "zod";
import { StateContext, useStateContext } from "./StateContext";
import {
  initializeFirebaseCoreServices,
  getAllCollectionDocs,
  getCeremonyCircuits
} from "../helpers/firebase";
import {
  CircuitDocumentReferenceAndData,
  ContributionDocumentReferenceAndData,
  ParticipantDocumentReferenceAndData
} from "../helpers/interfaces";


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
};

export const defaultProjectData: ProjectData = {};

type ProjectPageProviderProps = {
  children: React.ReactNode;
};

const ProjectPageContext = createContext<ProjectPageContextProps>({
  projectData: defaultProjectData,
  isLoading: false,
  runTutorial: false 
});

export const useProjectPageContext = () => useContext(ProjectPageContext);

export const ProjectPageProvider: React.FC<ProjectPageProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { loading: isLoading, setLoading: setIsLoading, runTutorial } = useContext(StateContext);
  const [projectData, setProjectData] = useState<ProjectData | null>(defaultProjectData);

  const { projects } = useStateContext();
  const { ceremonyName } = useParams();

  const project = projects.find((project) => project.ceremony.data.title === ceremonyName);
  const projectId = project?.ceremony.uid || "HmLZ1vjZjhDPU0v3q8kD";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { firestoreDatabase } = await initializeFirebaseCoreServices();

        const circuitsDocs = await getCeremonyCircuits(firestoreDatabase, projectId);
        const circuits: CircuitDocumentReferenceAndData[] = circuitsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data }));

        const participantsDocs = await getAllCollectionDocs(firestoreDatabase, `ceremonies/${projectId}/participants`);
        const participants: ParticipantDocumentReferenceAndData[] = participantsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data() }));

        let contributions: ContributionDocumentReferenceAndData[] = [];
        for (const circuit of circuits) {
          const contributionsDocs = await getAllCollectionDocs(firestoreDatabase, `ceremonies/${projectId}/circuits/${circuit.uid}/contributions`);
          contributions = contributions.concat(contributionsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data() })));
        }

        const updatedProjectData = { circuits, participants, contributions };
        const parsedData = ProjectDataSchema.parse(updatedProjectData);

        setProjectData(parsedData);
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
    <ProjectPageContext.Provider value={{ projectData, isLoading, runTutorial }}>
      {children}
    </ProjectPageContext.Provider>
  );
};
