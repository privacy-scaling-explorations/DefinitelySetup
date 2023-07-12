import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { StateContext, useStateContext } from "./StateContext";
import {
  CeremonyTimeoutType,
  CeremonyState,
  CeremonyType,
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
  ceremony: z.object({
    uid: z.string(),
    data: z.object({
      title: z.string(),
      description: z.string(),
      startDate: z.number(),
      endDate: z.number(),
      timeoutMechanismType: z.string(),
      penalty: z.number(),
      prefix: z.string(),
      state: z.string(),
      type: z.string(),
      coordinatorId: z.string(),
      lastUpdated: z.number()
    })
  }),
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
  ceremony: {
    uid: "A8CVrp2MMx7KO512KFdv",
    data: {
      title: "Ongoing ceremony",
      prefix: "example",
      description: "This is an example ceremony",
      startDate: new Date("2023-07-01").getTime(),
      endDate: new Date("2023-07-31").getTime(),
      timeoutMechanismType: CeremonyTimeoutType.FIXED,
      penalty: 3600,
      state: CeremonyState.OPENED,
      type: CeremonyType.PHASE2,
      coordinatorId: "uKm6XEjOKoeZUKAf2goY4vamgHE4",
      lastUpdated: Date.now()
    }
  }
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

  console.log(ceremonyName)
  const project = projects.find((project) => project.ceremony.data.title == ceremonyName);
  const projectId = project?.ceremony.uid ? project.ceremony.uid : "HmLZ1vjZjhDPU0v3q8kD";

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
          ...projectData,
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
  }, [navigate]);

  return (
    <ProjectPageContext.Provider value={{ projectData, isLoading }}>
      {children}
    </ProjectPageContext.Provider>
  );
};
