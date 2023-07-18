import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { StateContext } from "./StateContext";

import {
  initializeFirebaseCoreServices,
  getAllCollectionDocs,
  getCeremonyCircuits
} from "../helpers/utils";
import {
  CircuitDocumentReferenceAndData,
  ContributionDocumentReferenceAndData,
  ParticipantDocumentReferenceAndData
} from "../helpers/interfaces";
import { DocumentData } from "firebase/firestore";

export type LandingPageContextProps = {
  projectData: {
    circuits?: CircuitDocumentReferenceAndData[];
    participants?: ParticipantDocumentReferenceAndData[];
    contributions?: ContributionDocumentReferenceAndData[];
  };
  isLoading: boolean;
  index: number;
};
const LandingPageContext = createContext<LandingPageContextProps>({
  projectData: {},
  isLoading: false,
  index: 0
});

export const useLandingPageContext = () => useContext(LandingPageContext);

type LandingPageProviderProps = {
  children: React.ReactNode;
};

export const LandingPageProvider: React.FC<LandingPageProviderProps> = ({ children }) => {
  const { loading: isLoading, setLoading: setIsLoading, projects } = useContext(StateContext);

  // const projectId = "A8CVrp2MMx7KO512KFdv"; // aka ceremonyId.
  // const [index, setIndex] = useState(Math.floor(Math.random() * projects.length))

  const index = useMemo(() => {
    const i = Math.floor(Math.random() * projects.length);
    console.log(i);
    return i;
  }, [projects]);
  const cachedData = useMemo(() => projects[index], [projects]);
  const projectId = useMemo(() => {
    const t = cachedData?.ceremony.uid ?? null;
    console.log("id", t);
    return t;
  }, [projects]);

  const initialProjectData = cachedData as {
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
      if (projectId) {
        try {
          console.log("fsdafsdfas", projectId);
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
          console.log("LandingPage", updatedProjectData);
          setProjectData(updatedProjectData);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [projects]);

  return (
    <LandingPageContext.Provider value={{ projectData, isLoading, index }}>
      {children}
    </LandingPageContext.Provider>
  );
};
