import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentData } from "firebase/firestore";
import { z } from "zod";
import { StateContext, useStateContext } from "./StateContext";
import {
  getAllCollectionDocs,
  getCeremonyCircuits,
  getContributions,
  getFinalBeacon,
  getParticipantsAvatar
} from "../helpers/firebase";
import {
  CeremonyState,
  CircuitDocumentReferenceAndData,
  FinalBeacon,
  ParticipantDocumentReferenceAndData,
  ProjectPageContextProps,
  ZkeyDownloadLink
} from "../helpers/interfaces";
import {
  bytesToMegabytes,
  checkIfUserContributed,
  findLargestConstraint,
  formatZkeyIndex,
  parseDate,
  processItems,
  truncateString,
} from "../helpers/utils";
import { awsRegion, bucketPostfix, finalContributionIndex, maxConstraintsForBrowser } from "../helpers/constants";

export const ProjectDataSchema = z.object({
  circuits: z.optional(z.array(z.any())),
  participants: z.optional(z.array(z.any())),
  contributions: z.optional(z.array(z.any()))
});

type ProjectPageProviderProps = {
  children: React.ReactNode;
};

const ProjectPageContext = createContext<ProjectPageContextProps>({
  hasUserContributed: false,
  isLoading: false,
  runTutorial: false,
  avatars: [],
  largestCircuitConstraints: maxConstraintsForBrowser + 1, // contribution on browser has 100000 max constraints
  finalZkeys: []
});

export const useProjectPageContext = () => useContext(ProjectPageContext);

export const ProjectPageProvider: React.FC<ProjectPageProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { loading: isLoading, setLoading: setIsLoading, runTutorial } = useContext(StateContext);
  const [ avatars, setAvatars ] = useState<string[]>([]);
  const [ hasUserContributed, setHasUserContributed ] = useState<boolean>(false);
  const [ largestCircuitConstraints, setLargestCircuitConstraints ] = useState<number>(maxConstraintsForBrowser + 1) // contribution on browser has 100000 max constraints
  const [ finalZkeys, setFinalZkeys ] = useState<ZkeyDownloadLink[]>([])
  const [ latestZkeys, setLatestZkeys ] = useState<ZkeyDownloadLink[]>([])
  const [ finalBeacon, setFinalBeacon ] = useState<FinalBeacon>()
  const [ circuitsClean, setCircuitsClean ] = useState([]);
  const [ contributionsClean, setContributionsClean ] = useState([]);

  const { projects } = useStateContext();
  const { ceremonyName } = useParams();

  const project = projects.find((project) => project.ceremony.data.title === ceremonyName);
  const projectId = project?.ceremony.uid;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (projectId === undefined || project === undefined) return 
        const circuitsDocs = await getCeremonyCircuits(projectId);
        const circuits: CircuitDocumentReferenceAndData[] = circuitsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data }));

        const finalZkeys: ZkeyDownloadLink[] = []
        const lastZkeys: ZkeyDownloadLink[] = []
        for (const circuit of circuits) {
          const { prefix } = circuit.data
          finalZkeys.push(
            { 
              zkeyFilename: `${prefix}_${finalContributionIndex}.zkey`, 
              zkeyURL: `https://${project?.ceremony.data.prefix}${bucketPostfix}.s3.${awsRegion}.amazonaws.com/circuits/${
                prefix
              }/contributions/${prefix}_${finalContributionIndex}.zkey`
            }
          )

          // store the latest zkey for each circuit
          const { waitingQueue } = circuit.data 

          // if it's not finalized then we skip
          if (project.ceremony.data.state !== CeremonyState.FINALIZED) continue

          const index = formatZkeyIndex(waitingQueue!.completedContributions)
          lastZkeys.push(
            {
              zkeyFilename: `${prefix}_${index}.zkey`,
              zkeyURL: `https://${project?.ceremony.data.prefix}${bucketPostfix}.s3.${awsRegion}.amazonaws.com/circuits/${
                prefix
              }/contributions/${prefix}_${index}.zkey`
            }
          )
        }

        setLatestZkeys(lastZkeys)
        setFinalZkeys(finalZkeys)

        // if we have data for the ceremony and it's finalized then we can get the final beacon
        if (project.ceremony && project.ceremony.data.state === CeremonyState.FINALIZED) {
          const beacon = await getFinalBeacon(projectId, project.ceremony.data.coordinatorId, circuits[0].uid)
          setFinalBeacon(beacon)
        }

        const participantsDocs = await getAllCollectionDocs(`ceremonies/${projectId}/participants`);
        const participants: ParticipantDocumentReferenceAndData[] = participantsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data() }));

        // run concurrent requests per circuit
        const args: any[][] = circuits.map((circuit: CircuitDocumentReferenceAndData) => [projectId, circuit.uid])
        const { results } = await processItems(args, getContributions, true)
        
        const contributions = results.flat()

        const updatedProjectData = { circuits, participants, contributions };
        
        const parsedData = ProjectDataSchema.parse(updatedProjectData);

        setCircuitsClean(
          parsedData.circuits?.map((circuit) => ({
            template: circuit.data.template,
            compiler: circuit.data.compiler,
            name: circuit.data.name,
            description: circuit.data.description,
            constraints: circuit.data.metadata?.constraints,
            pot: circuit.data.metadata?.pot,
            privateInputs: circuit.data.metadata?.privateInputs,
            publicInputs: circuit.data.metadata?.publicInputs,
            curve: circuit.data.metadata?.curve,
            wires: circuit.data.metadata?.wires,
            completedContributions: circuit.data.waitingQueue?.completedContributions,
            currentContributor: circuit.data.waitingQueue?.currentContributor,
            memoryRequirement: bytesToMegabytes(circuit.data.zKeySizeInBytes ?? Math.pow(1024, 2))
              .toString()
              .slice(0, 5),
            avgTimingContribution: Math.round(Number(circuit.data.avgTimings?.fullContribution) / 1000),
            maxTiming: Math.round((Number(circuit.data.avgTimings?.fullContribution) * 1.618) / 1000)
          })) ?? []
        );

        // parse contributions and sort by zkey name. FIlter for valid contribs.
        setContributionsClean(
          parsedData.contributions?.map((contribution) => ({
            doc: contribution.data.files?.lastZkeyFilename ?? "",
            circuit: contribution.data.files?.lastZkeyFilename
              .replace(`_${contribution.data.zkeyIndex}.zkey`, ''),
            verificationComputationTime: contribution.data?.verificationComputationTime ?? "",
            valid: contribution.data?.valid ?? false,
            lastUpdated: parseDate(contribution.data?.lastUpdated ?? ""),
            lastZkeyBlake2bHash: truncateString(contribution.data?.files?.lastZkeyBlake2bHash ?? "", 10),
            transcriptBlake2bHash: truncateString(
              contribution.data?.files?.transcriptBlake2bHash ?? "",
              10
            )
          })).slice()
            .filter((c: any) => c.valid)
            .reduce((out, cur) => {
              if(!(cur.circuit in out)) out[cur.circuit] = [];
              out[cur.circuit].push(cur);
              return out;
            }, {}) ?? {}
        );

        const avatars = await getParticipantsAvatar(projectId)
        setAvatars(avatars)

        const hasContributed = await checkIfUserContributed(projectId)
        setHasUserContributed(hasContributed)

        const _constraints = findLargestConstraint(circuits)
        setLargestCircuitConstraints(_constraints)
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
    <ProjectPageContext.Provider value={{
      latestZkeys,
      finalBeacon,
      finalZkeys,
      largestCircuitConstraints,
      hasUserContributed,
      circuitsClean,
      contributionsClean,
      isLoading,
      runTutorial,
      avatars
    }}>
      {children}
    </ProjectPageContext.Provider>
  );
};
