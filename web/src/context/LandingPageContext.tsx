import { createContext, useContext, useEffect, useState } from "react";

import { StateContext } from "./StateContext";

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
import { DocumentData } from "firebase/firestore";
import {
  defaultProjectData
} from "./ProjectPageContext";

export type LandingPageContextProps = {
  projectData: {
    circuits?: CircuitDocumentReferenceAndData[];
    participants?: ParticipantDocumentReferenceAndData[];
    contributions?: ContributionDocumentReferenceAndData[];
  };
  isLoading: boolean;
};
const LandingPageContext = createContext<LandingPageContextProps>({
  projectData: {},
  isLoading: false
});

export const useLandingPageContext = () => useContext(LandingPageContext);

type LandingPageProviderProps = {
  children: React.ReactNode;
};

export const LandingPageProvider: React.FC<LandingPageProviderProps> = ({ children }) => {
  const { loading: isLoading, setLoading: setIsLoading, projects } = useContext(StateContext);

  const projectId = "A8CVrp2MMx7KO512KFdv"; // aka ceremonyId.

  const cachedData = projects.find((project) => project.ceremony.uid == projectId);
  const initialProjectData = (cachedData ? cachedData.ceremony : defaultProjectData) as {
    circuits: CircuitDocumentReferenceAndData[];
    participants: ParticipantDocumentReferenceAndData[];
    contributions: ContributionDocumentReferenceAndData[];
  };
  const [projectData, setProjectData] = useState<{
    circuits: CircuitDocumentReferenceAndData[];
    participants: ParticipantDocumentReferenceAndData[];
    contributions: ContributionDocumentReferenceAndData[];
  }>(initialProjectData);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { firestoreDatabase } = await initializeFirebaseCoreServices();
        const circuitsDocs = await getCeremonyCircuits(firestoreDatabase, projectId);
        const circuits: CircuitDocumentReferenceAndData[] = circuitsDocs.map(
          (document: DocumentData) => ({ uid: document.id, data: document.data })
        );

        const participantsDocs = await getAllCollectionDocs(
          firestoreDatabase,
          `ceremonies/${projectId}/participants`
        );
        const participants: ParticipantDocumentReferenceAndData[] = participantsDocs.map(
          (document: DocumentData) => ({ uid: document.id, data: document.data() })
        );

        let contributions: ContributionDocumentReferenceAndData[] = [];
        for (const circuit of circuits) {
          const contributionsDocs = await getAllCollectionDocs(
            firestoreDatabase,
            `ceremonies/${projectId}/circuits/${circuit.uid}/contributions`
          );
          contributions = contributions.concat(
            contributionsDocs.map((document: DocumentData) => ({
              uid: document.id,
              data: document.data()
            }))
          );
        }

        const updatedProjectData = { ...projectData, circuits, participants, contributions };
        console.log("LandingPage", updatedProjectData)
        setProjectData(updatedProjectData);
      } catch (error) {
        console.error(error);
      } finally {
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
