import React, { useState, createContext, useEffect, useContext } from "react";
import { CeremonyDocumentReferenceAndData, CeremonyState, CeremonyTimeoutType, CeremonyType, CircuitContributionVerificationMechanism, CircuitDocumentReferenceAndData, Project, State, StateProviderProps, WaitingQueue } from "../helpers/interfaces";
import { getAllCollectionDocs, getCeremonyCircuitsWaitingQueue } from "../helpers/firebase";
import { DocumentData } from 'firebase/firestore'
import { commonTerms } from "../helpers/constants";

export const StateContext = createContext<State>({
  projects: [
    // Initial project data
    {
      ceremony: {
        uid: "i3kFOOUi8L42ooRWQh8N",
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
  circuit: {
    uid: "000000000000000000A1",
    data: {
        name: "Circuit Small",
        description: "Short description of Circuit Small",
        prefix: "circuit-small",
        sequencePosition: 1,
        fixedTimeWindow: 10,
        zKeySizeInBytes: 45020,
        lastUpdated: Date.now(),
        metadata: {
            constraints: 65,
            curve: "bn-128",
            labels: 79,
            outputs: 1,
            pot: 7,
            privateInputs: 0,
            publicInputs: 2,
            wires: 67
        },
        template: {
            commitHash: "295d995802b152a1dc73b5d0690ce3f8ca5d9b23",
            paramsConfiguration: ["2"],
            source: "https://github.com/0xjei/circom-starter/blob/dev/circuits/exercise/checkAscendingOrder.circom"
        },
        waitingQueue: {
            completedContributions: 0,
            contributors: [],
            currentContributor: "",
            failedContributions: 0
        },
        files: {
            initialZkeyBlake2bHash:
                "eea0a468524a984908bff6de1de09867ac5d5b0caed92c3332fd5ec61004f79505a784df9d23f69f33efbfef016ad3138871fa8ad63b6e8124a9d0721b0e9e32",
            initialZkeyFilename: "circuit_small_00000.zkey",
            initialZkeyStoragePath: "circuits/circuit_small/contributions/circuit_small_00000.zkey",
            potBlake2bHash:
                "34379653611c22a7647da22893c606f9840b38d1cb6da3368df85c2e0b709cfdb03a8efe91ce621a424a39fe4d5f5451266d91d21203148c2d7d61cf5298d119",
            potFilename: "powersOfTau28_hez_final_02.ptau",
            potStoragePath: "pot/powersOfTau28_hez_final_02.ptau",
            r1csBlake2bHash:
                "0739198d5578a4bdaeb2fa2a1043a1d9cac988472f97337a0a60c296052b82d6cecb6ae7ce503ab9864bc86a38cdb583f2d33877c41543cbf19049510bca7472",
            r1csFilename: "circuit_small.r1cs",
            r1csStoragePath: "circuits/circuit_small/circuit_small.r1cs",
            wasmBlake2bHash:
                "00d09469acaba682802bf92df24708cf3d499b759379f959c4b6932b14fe9e6bfccc793c3933eac4a76546171d402cab1ae3ce1b3291dbba8e2fb358d52bd77d",
            wasmFilename: "circuit_small.wasm",
            wasmStoragePath: "circuits/circuit_small/circuit_small.wasm"
        },
        avgTimings: {
            contributionComputation: 0,
            fullContribution: 0,
            verifyCloudFunction: 0
        },
        compiler: {
            commitHash: "ed807764a17ce06d8307cd611ab6b917247914f5",
            version: "2.0.5"
        },
        verification: {
            cfOrVm: CircuitContributionVerificationMechanism.CF,
            vm: {
                vmConfigurationType: ""
            }
        }
    }
  },
  setCircuit: () => null,
  search: "",
  setSearch: () => null,
  loading: false,
  setLoading: () => null,
  runTutorial: false,
  setRunTutorial: () => null,
  setUser: () => {},
  waitingQueue: [{} as WaitingQueue]
});

export const useInitialStateContext = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [circuit, setCircuit] = useState<CircuitDocumentReferenceAndData>();
  const [waitingQueue, setWaitingQueue] = useState<WaitingQueue[]>([])
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [runTutorial, setRunTutorial] = useState<boolean>(false);

   // Fetch ceremony data.
  useEffect(() => {
    const fetchData = async () => {
      // 0. Prepare service.
      setLoading(true)

      // 1. Fetch data.
      const docs = await getAllCollectionDocs(commonTerms.collections.ceremonies.name)

      // 2. Post-process data.
      const ceremonies: CeremonyDocumentReferenceAndData[] = docs.map((document: DocumentData) => { return { uid: document.id, data: document.data() } })
      const projects: Project[] = ceremonies.map((ceremony: CeremonyDocumentReferenceAndData) => { return { ceremony: ceremony } })

      const queue: WaitingQueue[] = []
      for (const project of projects) {
        if (project.ceremony.data.state === CeremonyState.OPENED) {
          const tmpQueue = await getCeremonyCircuitsWaitingQueue(project.ceremony.uid, project.ceremony.data.title)
          queue.push(...tmpQueue)
        }
      }

      setWaitingQueue(queue)
      // 3. Store data.      
      setProjects(projects)
      setLoading(false)
    }

    setRunTutorial(true)

    fetchData()
   
  },[])

  return { waitingQueue, projects, setProjects, circuit, setCircuit, search, setSearch, loading, setLoading, runTutorial, setRunTutorial };
};

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
 
  const [user, setUser] = useState<string | undefined>(
    localStorage.getItem("username") || undefined
  );

  useEffect(() => {
    const _user = localStorage.getItem("username")?.toString() || "";
    if (_user !== user) {
      setUser(_user);
    }
  }, [user]);


  const state = useInitialStateContext()

  return (
    // @ts-ignore
    <StateContext.Provider value={{...state, user, setUser }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);