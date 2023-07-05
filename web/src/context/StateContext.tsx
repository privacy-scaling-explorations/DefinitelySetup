// useStateContext.tsx

import React, { useState, createContext } from "react";
import { CeremonyDocumentReferenceAndData, CeremonyState, CeremonyTimeoutType, CeremonyType, CircuitDocument, ContributionDocument, ParticipantDocument } from "../helpers/interfaces";

export interface Project {
  ceremony: CeremonyDocumentReferenceAndData
  circuit?: CircuitDocument
  participants?: ParticipantDocument
  contributions?: ContributionDocument
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

  return { projects, setProjects, search, setSearch, loading, setLoading };
};
