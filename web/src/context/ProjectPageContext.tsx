import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { StateContext, useStateContext } from "./StateContext";
import {
  CircuitDocumentReferenceAndData,
  ContributionDocumentReferenceAndData,
  ParticipantDocumentReferenceAndData
} from "../helpers/interfaces";
import {
  initializeFirebaseCoreServices,
  getAllCollectionDocs,
  getCeremonyCircuits
} from "../helpers/utils";
import { DocumentData } from "firebase/firestore";

export const ProjectDataSchema = z.object({
  // @todo add manually all the missing fields inside this objects from interfaces.
  circuits: z.optional(z.array(z.any())),
  participants: z.optional(z.array(z.any())),
  contributions: z.optional(z.array(z.any()))
});

export type ProjectData = z.infer<typeof ProjectDataSchema>;

export type ProjectPageContextProps = {
  projectData: ProjectData | null;
  isLoading: boolean;
};

export const defaultProjectData: ProjectData = {
  
};




const ProjectPageContext = createContext<ProjectPageContextProps>({
  projectData: defaultProjectData,
  isLoading: false
});

export const useProjectPageContext = () => useContext(ProjectPageContext);

type ProjectPageProviderProps = {
  children: React.ReactNode;
};

export const ProjectPageProvider: React.FC<ProjectPageProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  // Initial State
  const { loading: isLoading, setLoading: setIsLoading } = useContext(StateContext);
  const [projectData, setProjectData] = useState<ProjectData | null>(defaultProjectData);
  
 
  // Fetch from cached project data
  const { projects } = useStateContext();
  const { ceremonyName } = useParams();

  
  const project = projects.find((project) => project.ceremony.data.title == ceremonyName) ;
  const projectId = project?.ceremony.uid ? project.ceremony.uid : "HmLZ1vjZjhDPU0v3q8kD";
  console.log(ceremonyName, projectId)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 0. Prepare service.
        const { firestoreDatabase } = await initializeFirebaseCoreServices();

        // 1. Fetch and prepare data.
        const circuitsDocs = await getCeremonyCircuits(firestoreDatabase, projectId);
        const circuits: CircuitDocumentReferenceAndData[] = circuitsDocs.map( (document: DocumentData) => { return { uid: document.id, data: document.data } } );

        const participantsDocs = await getAllCollectionDocs( firestoreDatabase, `ceremonies/${projectId}/participants`);
        const participants: ParticipantDocumentReferenceAndData[] = participantsDocs.map((document: DocumentData) => { return { uid: document.id, data: document.data() } } );

        // merge arrays of multiple circuits contributions in one array.
        let contributions: ContributionDocumentReferenceAndData[] = [];

        for (const circuit of circuits) {
          const contributionsDocs = await getAllCollectionDocs(
            firestoreDatabase,
            `ceremonies/${projectId}/circuits/${circuit.uid}/contributions`
          );

          contributions = contributions.concat(
            contributionsDocs.map((document: DocumentData) => {
              return { uid: document.id, data: document.data() };
            })
          );
        }

        // 3. Update project data.
        const updatedProjectData = {
          circuits,
          participants,
          contributions
        };
        const parsedData = ProjectDataSchema.parse(updatedProjectData);
        setProjectData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        navigate("/error");
      }
    };

    fetchData();
  }, [navigate, projectId]);

  return (
    <ProjectPageContext.Provider value={{ projectData, isLoading }}>
      {children}
    </ProjectPageContext.Provider>
  );
};
