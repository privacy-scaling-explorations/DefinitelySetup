// useStateContext.tsx

import React, { useState, createContext, useEffect } from "react";
import { CeremonyDocumentReferenceAndData, CeremonyState, CeremonyTimeoutType, CeremonyType, CircuitDocumentReferenceAndData, ContributionDocumentReferenceAndData, ParticipantDocumentReferenceAndData } from "../helpers/interfaces";
import { getAllCollectionDocs, initializeFirebaseCoreServices } from "../helpers/utils";
import { DocumentData } from 'firebase/firestore'

export interface Project {
  ceremony: CeremonyDocumentReferenceAndData
  circuits?: CircuitDocumentReferenceAndData[] | null
  participants?: ParticipantDocumentReferenceAndData[] | null
  contributions?: ContributionDocumentReferenceAndData[] | null
}

export interface State {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StateContext = createContext<State>({
  projects: [
    // Initial project data
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "example",
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
    }
  ],
  setProjects: () => null,
  search: "",
  setSearch: () => null,
  loading: false,
  setLoading: () => null
});

export const useInitialStateContext = () => {
  const [projects, setProjects] = useState<Project[]>([
    // Initial project data
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "@semaphore-protocol-example",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "@maci-protocol-example",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "@rln-example",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "@zkecdsa-example",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "test1",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "test2",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "test3",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "test4",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "test5",
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
    },
    {
      ceremony: {
        uid: "z37Z6PiCNPACp4gY9EMy",
        data: {
          title: "test6",
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
    },

  ]);

  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);


  // Fetch ceremony data.
  useEffect(() => {
    const fetchData = async () => {
      // 0. Prepare service.
      const { firestoreDatabase } = await initializeFirebaseCoreServices()

      // 1. Fetch data.
      const docs = await getAllCollectionDocs(firestoreDatabase, `ceremonies`)

      // 2. Post-process data.
      const ceremonies: CeremonyDocumentReferenceAndData[] = docs.map((document: DocumentData) => { return { uid: document.id, data: document.data() } })
      const projects: Project[] = ceremonies.map((ceremony: CeremonyDocumentReferenceAndData) => { return { ceremony: ceremony } })

      // 3. Store data.      
      setProjects(projects)
    }

    fetchData()
  })

  return { projects, setProjects, search, setSearch, loading, setLoading };
};
