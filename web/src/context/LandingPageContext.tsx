import { createContext, useContext, useEffect, useState } from "react";
import { StateContext } from "./StateContext";
import {  CircuitDocumentReferenceAndData, ContributionDocumentReferenceAndData, ParticipantDocumentReferenceAndData } from "../helpers/interfaces";
import { initializeFirebaseCoreServices, getAllCollectionDocs, getCeremonyCircuits } from "../helpers/utils";
import { DocumentData } from "firebase/firestore";
import { ProjectData, ProjectDataSchema, ProjectPageContextProps, defaultProjectData } from "./ProjectPageContext";



const LandingPageContext = createContext<ProjectPageContextProps>({
  projectData: defaultProjectData,
  isLoading: false
});

export const useLandingPageContext = () => useContext(LandingPageContext);

type LandingPageProviderProps = {
  children: React.ReactNode;
};

export const LandingPageProvider: React.FC<LandingPageProviderProps> = ({ children }) => {
  const projectId = "A8CVrp2MMx7KO512KFdv" // aka ceremonyId.
  const { loading: isLoading, setLoading: setIsLoading } = useContext(StateContext);

  console.log("landing page")

  const [projectData, setProjectData] = useState<ProjectData | null>(defaultProjectData);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 0. Prepare service.
        const { firestoreDatabase } = await initializeFirebaseCoreServices()

        // 1. Fetch and prepare data.
        const circuitsDocs = await getCeremonyCircuits(firestoreDatabase, projectId)
        const circuits: CircuitDocumentReferenceAndData[] = circuitsDocs.map((document: DocumentData) => { return { uid: document.id, data: document.data } })

        const participantsDocs = await getAllCollectionDocs(firestoreDatabase, `ceremonies/${projectId}/participants`)
        const participants: ParticipantDocumentReferenceAndData[] = participantsDocs.map((document: DocumentData) => { return { uid: document.id, data: document.data() } })

        // merge arrays of multiple circuits contributions in one array.
        let contributions: ContributionDocumentReferenceAndData[] = []

        for (const circuit of circuits) {
          const contributionsDocs = await getAllCollectionDocs(firestoreDatabase, `ceremonies/${projectId}/circuits/${circuit.uid}/contributions`)

          contributions = contributions.concat(contributionsDocs.map((document: DocumentData) => { return { uid: document.id, data: document.data() } }))
        }

        // DEBUG ONLY.
        console.log("circuits ", circuits)
        console.log("participants ", participants)
        console.log("contributions ", contributions)
        
        // 3. Update project data.
        const updatedProjectData = {
          ...projectData,
          circuits,
          participants,
          contributions
        }

        const parsedData = ProjectDataSchema.parse(updatedProjectData);
        setProjectData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      
      }
    };

    fetchData();
  }, []);

  return (
    <LandingPageContext.Provider value={{ projectData, isLoading }}>
      {children}
    </LandingPageContext.Provider>
  );
};
