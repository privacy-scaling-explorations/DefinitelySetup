import { DocumentData, DocumentReference } from "firebase/firestore";
import { z } from "zod";
import { ProjectDataSchema } from "../context/ProjectPageContext";

/**
 * Define different states of a ceremony.
 * @enum {string}
 * - SCHEDULED: when the ceremony setup has been properly completed but the contribution period has not yet started.
 * - OPENED: when the contribution period has started.
 * - PAUSED: When the coordinator has manually paused the ceremony (NB. currently not possible because the relevant functionality has not yet been implemented).
 * - CLOSED: when the contribution period has finished.
 * - FINALIZED: when the ceremony finalization has been properly completed.
 */
export const enum CeremonyState {
  SCHEDULED = "SCHEDULED",
  OPENED = "OPENED",
  PAUSED = "PAUSED",
  CLOSED = "CLOSED",
  FINALIZED = "FINALIZED"
}

/**
* Define the type of Trusted Setup ceremony (Phase 1 or Phase 2).
* @enum {string}
* - PHASE1: when the ceremony is a Phase 1 Trusted Setup ceremony.
* - PHASE2: when the ceremony is a Phase 2 Trusted Setup ceremony.
*/
export const enum CeremonyType {
  PHASE1 = "PHASE1",
  PHASE2 = "PHASE2"
}

/**
* Define different status of a participant.
* @enum {string}
* - CREATED: when the participant document has been created in the database.
* - WAITING: when the participant is waiting for a contribution (i.e., is currently queued or is waiting for its status to be checked after a timeout expiration).
* - READY: when the participant is ready for a contribution.
* - CONTRIBUTING: when the participant is currently contributing (i.e., not queued anymore, but the current contributor at this time).
* - CONTRIBUTED: when the participant has completed successfully the contribution for all circuits in a ceremony. The participant may need to wait for the latest contribution verification while having this status.
* - DONE: when the participant has completed contributions and verifications from coordinator.
* - FINALIZING: when the coordinator is currently finalizing the ceremony.
* - FINALIZED: when the coordinator has successfully finalized the ceremony.
* - TIMEDOUT: when the participant has been timedout while contributing. This may happen due to network or memory issues, un/intentional crash, or contributions lasting for too long.
* - EXHUMED: when the participant is ready to resume the contribution after a timeout expiration.
*/
export const enum ParticipantStatus {
  CREATED = "CREATED",
  WAITING = "WAITING",
  READY = "READY",
  CONTRIBUTING = "CONTRIBUTING",
  CONTRIBUTED = "CONTRIBUTED",
  DONE = "DONE",
  FINALIZING = "FINALIZING",
  FINALIZED = "FINALIZED",
  TIMEDOUT = "TIMEDOUT",
  EXHUMED = "EXHUMED"
}

/**
* Define different steps during which the participant may be during the contribution.
* @enum {string}
* - DOWNLOADING: when the participant is doing the download of the last contribution (from previous participant).
* - COMPUTING: when the participant is actively computing the contribution.
* - UPLOADING: when the participant is uploading the computed contribution.
* - VERIFYING: when the participant is waiting from verification results from the coordinator.
* - COMPLETED: when the participant has received the verification results from the coordinator and completed the contribution steps.
*/
export const enum ParticipantContributionStep {
  DOWNLOADING = "DOWNLOADING",
  COMPUTING = "COMPUTING",
  UPLOADING = "UPLOADING",
  VERIFYING = "VERIFYING",
  COMPLETED = "COMPLETED"
}

/**
* Define what type of timeout was performed.
* @enum {string}
* - BLOCKING_CONTRIBUTION: when the current contributor was blocking the waiting queue.
* - BLOCKING_CLOUD_FUNCTION: when the contribution verification has gone beyond the time limit.
*/
export const enum TimeoutType {
  BLOCKING_CONTRIBUTION = "BLOCKING_CONTRIBUTION",
  BLOCKING_CLOUD_FUNCTION = "BLOCKING_CLOUD_FUNCTION"
}

/**
* Define what type of timeout mechanism is currently adopted for a ceremony.
* @enum {string}
* - DYNAMIC: self-update approach based on latest contribution time.
* - FIXED: approach based on a fixed amount of time.
*/
export const enum CeremonyTimeoutType {
  DYNAMIC = "DYNAMIC",
  FIXED = "FIXED"
}

/**
* Define request type for pre-signed urls.
*/
export const enum RequestType {
  PUT = "PUT",
  GET = "GET"
}

/**
* Define the environment in use when testing.
* @enum {string}
* - DEVELOPMENT: tests are performed on the local Firebase emulator instance.
* - PRODUCTION: tests are performed on the remote (deployed) Firebase application.
*/
export const enum TestingEnvironment {
  DEVELOPMENT = "DEVELOPMENT",
  PRODUCTION = "PRODUCTION"
}

/**
* Define what type of contribution verification mechanism is currently adopted for a circuit.
* @enum {string}
* - CF: Cloud Functions.
* - VM: Virtual Machine.
*/
export const enum CircuitContributionVerificationMechanism {
  CF = "CF",
  VM = "VM"
}

/**
* Define the supported VM volume types.
* @dev the VM volume types can be retrieved at https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html
* @enum {string}
* - GP2: General Purpose SSD version 2.
* - GP3: General Purpose SSD version 3.
* - IO1: Provisioned IOPS SSD volumes version 1.
* - ST1: Throughput Optimized HDD volumes.
* - SC1: Cold HDD volumes.
*/
export const enum DiskTypeForVM {
  GP2 = "gp2",
  GP3 = "gp3",
  IO1 = "io1",
  ST1 = "st1",
  SC1 = "sc1"
}

/**
 * Necessary data to define a ceremony database document.
 * @dev The data is both entered by the coordinator and derived.
 * @property {string} title - the title/name of the ceremony.
 * @property {string} description - a brief description of the ceremony.
 * @property {number} startDate - the start (opening to contributions) date for the ceremony (in ms).
 * @property {number} endDate - the end (closing to contributions) date for the ceremony (in ms).
 * @property {CeremonyTimeoutType} timeoutMechanismType - the timeout mechanism type used for avoiding blocking contribution behaviours.
 * @property {number} penalty - the amount of time expressed in minutes that the blocking contributor has to wait before joining the waiting queue again.
 * @property {string} prefix - the prefix of the ceremony derived from the name.
 * @property {CeremonyState} state - the current state of the ceremony.
 * @property {CeremonyType} type - the type of the ceremony.
 * @property {string} coordinatorId - the unique identifier of the coordinator.
 * @property {number} lastUpdated - the timestamp where the last update of the Firestore document has happened.
 */
export interface CeremonyDocument {
  title: string
  description: string
  startDate: number
  endDate: number
  timeoutMechanismType: CeremonyTimeoutType
  penalty: number
  prefix: string
  state: CeremonyState
  type: CeremonyType
  coordinatorId: string
  lastUpdated: number
}

/**
 * Necessary data to define a circuit database document.
 * @property {CircuitMetadata} metadata - the info about the circuit metadata.
 * @property {CircuitArtifacts} [files] - the references about the circuit artifacts.
 * @property {CircuitTimings} [avgTimings] - the info about the average timings for the circuit.
 * @property {SourceTemplateData} [template] - the info about the circuit template.
 * @property {CircomCompilerData} [compiler] - the info about the circom compiler.
 * @property {CircuitWaitingQueue} [waitingQueue] - the info about the circuit waiting queue.
 * @property {number} [lastUpdated] - the timestamp where the last update of the Firestore document has happened.
 */
export interface CircuitDocument {
  description: string
  compiler: {
    version: string
    commitHash: string
  }
  template: {
    source: string
    commitHash: string
    paramsConfiguration: Array<string>
  },
  verification: {
    cfOrVm: CircuitContributionVerificationMechanism
    vm?: {
      vmConfigurationType?: string
      vmDiskType?: DiskTypeForVM
      vmDiskSize?: number
      vmInstanceId?: string
    }
  },
  compilationArtifacts?: {
    r1csFilename: string
    wasmFilename: string
  }
  metadata?: {
    curve: string
    wires: number
    constraints: number
    privateInputs: number
    publicInputs: number
    labels: number
    outputs: number
    pot: number
  }
  name?: string
  dynamicThreshold?: number
  fixedTimeWindow?: number
  sequencePosition?: number
  prefix?: string
  zKeySizeInBytes?: number
  files?: {
    potFilename: string
    r1csFilename: string
    wasmFilename: string
    initialZkeyFilename: string
    potStoragePath: string
    r1csStoragePath: string
    wasmStoragePath: string
    initialZkeyStoragePath: string
    potBlake2bHash: string
    r1csBlake2bHash: string
    wasmBlake2bHash: string
    initialZkeyBlake2bHash: string
  }
  avgTimings?: {
    contributionComputation: number
    fullContribution: number
    verifyCloudFunction: number
  }
  waitingQueue?: {
    completedContributions: number
    contributors: Array<string>
    currentContributor: string
    failedContributions: number
  }
  lastUpdated?: number
}


/**
 * Necessary data to define a participant database document.
 * @property {string} userId - the unique identifier of the user associated with the participant.
 * @property {number} contributionProgress - indicates the number of the circuit for which the user has to wait in the queue.
 * @property {ParticipantStatus} status - the current status of the participant.
 * @property {Array<Contribution>} contributions - the list of references to the contributions computed by the participant.
 * @property {number} lastUpdated - the timestamp where the last update of the Firestore document has happened.
 * @property {number} [contributionStartedAt] - the timestamp of when the latest contribution has started.
 * @property {number} [verificationStartedAt] - the timestamp of when the latest verification process has started.
 * @property {TemporaryParticipantContributionData} [tempContributionData] - the auxiliary data needed for resumption in an intermediate step of contribution.
 */
export interface ParticipantDocument {
  userId: string
  contributionProgress: number
  status: ParticipantStatus
  contributions: Array<{
    doc: string
    computationTime: number
    hash: string
  }>
  lastUpdated: number
  contributionStartedAt: number
  contributionStep?: ParticipantContributionStep
  verificationStartedAt?: number
  tempContributionData?: {
    contributionComputationTime: number
    uploadId: string
    chunks: Array<{
      ETag: string | undefined
      PartNumber: number
    }>
  }
}

/**
 * Necessary data to define a contribution document.
 * @property {string} participantId - the unique identifier of the contributor.
 * @property {number} contributionComputationTime - the amount of time spent for the contribution (download, compute, upload).
 * @property {number} verificationComputationTime - the amount of time spent for the verification of the contribution.
 * @property {string} zkeyIndex - the index of the contribution.
 * @property {ContributionFiles} files - the references and hashes of the artifacts produced during the contribution (and verification).
 * @property {ContributionVerificationSoftware} verificationSoftware - the info about the verification software used to verify the contributions.
 * @property {boolean} valid - true if the contribution has been evaluated as valid; otherwise false.
 * @property {number} lastUpdated - the timestamp where the last update of the Firestore document has happened.
 * @property {BeaconInfo} beacon - the data about the value used to compute the final contribution while finalizing the ceremony (final contribution only).
 */
export interface ContributionDocument {
  participantId: string
  contributionComputationTime: number
  verificationComputationTime: number
  zkeyIndex: string
  files: {
    transcriptFilename: string
    lastZkeyFilename: string
    transcriptStoragePath: string
    lastZkeyStoragePath: string
    transcriptBlake2bHash: string
    lastZkeyBlake2bHash: string
    verificationKeyBlake2bHash?: string
    verificationKeyFilename?: string
    verificationKeyStoragePath?: string
    verifierContractBlake2bHash?: string
    verifierContractFilename?: string
    verifierContractStoragePath?: string
  }
  verificationSoftware: {
    name: string
    version: string
    commitHash: string
  }
  valid: boolean
  lastUpdated: number
  beacon?: {
    value: string
    hash: string
  }
}

/**
 * Define a circuit document reference and data.
 * @dev must be used for generating fake/mock documents when testing.
 * @property {string} uid - the unique identifier of the document.
 * @property {CircuitDocument} doc - the info about the circuit document.
 */
export interface CircuitDocumentReferenceAndData {
  uid: string
  data: CircuitDocument
}

/**
* Define a ceremony document reference and data.
* @dev must be used for generating fake/mock documents when testing.
* @property {string} uid - the unique identifier of the document.
* @property {CeremonyDocument} doc - the info about the ceremony document.
*/
export interface CeremonyDocumentReferenceAndData {
  uid: string
  data: CeremonyDocument
}

/**
* Define a participant document reference and data.
* @dev must be used for generating fake/mock documents when testing.
* @property {string} uid - the unique identifier of the document.
* @property {ParticipantDocument} doc - the info about the participant document.
*/
export interface ParticipantDocumentReferenceAndData {
  uid: string
  data: ParticipantDocument
}

/**
* Define a contribution document reference and data.
* @dev must be used for generating fake/mock documents when testing.
* @property {string} uid - the unique identifier of the document.
* @property {ContributionDocument} doc - the info about the contribution document.
*/
export interface ContributionDocumentReferenceAndData {
  uid: string
  data: ContributionDocument
}


export interface HeroComponentProps {
  projects: Project[];
  waitingQueue: WaitingQueue[];
}

/**
 * Useful for interacting with reference and data from a Firestore document at the same time.
 * @typedef {Object} FirebaseDocumentInfo
 * @property {string} id - the unique identifier of the Firestore document.
 * @property {DocumentReference<DocumentData>} ref - the Firestore reference for the document (useful for queries).
 * @property {DocumentData} data - the Firestore document whole data.
 */
export type FirebaseDocumentInfo = {
  id: string
  ref: DocumentReference<DocumentData>
  data: DocumentData
}

/**
 * Group a pre-signed url chunk core information.
 * @typedef {Object} ETagWithPartNumber
 * @property {string | null} ETag - a unique reference to this chunk associated to a pre-signed url.
 * @property {number} PartNumber - indicate where the chunk is positioned in order to reconhstruct the file with multiPartUpload/Download.
 */
export type ETagWithPartNumber = {
  ETag: string | undefined
  PartNumber: number
}

/**
 * Auxiliary data needed for resumption in an intermediate step of contribution.
 * @dev The data is used when the current contributorinterrupts during the download, contribute, upload steps
 * to prevent it from having to start over but can pick up where it left off.
 * This restart operation does NOT interact with the timeout mechanism (which remains unchanged).
 * @typedef {Object} TemporaryParticipantContributionData
 * @property {number} contributionComputationTime - the time spent since the contribution start.
 * @property {string} uploadId - the unique identifier of the pre-signed url PUT request to upload the newest contribution.
 * @property {Array<ETagWithPartNumber>} chunks - the list of ETags and PartNumbers that make up the chunks.
 */
export type TemporaryParticipantContributionData = {
  contributionComputationTime: number
  uploadId: string
  chunks: Array<ETagWithPartNumber>
}

/**
 * Define a custom file data chunk associated with a pre-signed url.
 * @dev Useful when interacting with AWS S3 buckets using pre-signed urls for multi-part upload or download storing temporary information on the database.
 * @typedef {Object} ChunkWithUrl
 * @property {number} partNumber - indicate where the chunk is positioned in order to reconhstruct the file with multiPartUpload/Download.
 * @property {Uint8Array} chunk - the piece of information in bytes.
 * @property {string} preSignedUrl - the unique reference to the pre-signed url to which this chunk is linked too.
 */
export type ChunkWithUrl = {
  partNumber: number
  chunk: Uint8Array
  preSignedUrl: string
}

/**
 * Define a custom object for time management tasks.
 * @typedef {Object} Timing
 * @property {number} seconds
 * @property {number} minutes
 * @property {number} hours
 * @property {number} days
 */
export type Timing = {
  seconds: number
  minutes: number
  hours: number
  days: number
}

/**
 * Data defining a contribution made by a participant.
 * @typedef {Object} Contribution
 * @property {string} doc - the unique identifier of the document related to the contribution.
 * @property {number} computationTime - the overall time spent while computing the contribution.
 * @property {string} hash - the contribution hash (generated as output from the snarkjs command).
 */
export type Contribution = {
  doc: string
  computationTime: number
  hash: string
}

/**
 * Group the information when retrieving the validity of a contribution for a contributor.
 * @typedef {Object} ContributionValidity
 * @property {string} contributionId - the unique identifier of the contribution.
 * @property {string} circuitId - the unique identifier of the circuit for which the contribution was computed.
 * @property {boolean} valid - true if and only if the contribution is valid; otherwise false.
 */
export type ContributionValidity = {
  contributionId: string
  circuitId: string
  valid: boolean
}

/**
 * Group the information for downloading a circuit's final zKey
 * @typedef {Object} ZkeyDownloadLink
 * @property {string} zkeyFilename - the name of the zKey file.
 * @property {string} zkeyURL - the url to download the zKey file.
 */
export interface ZkeyDownloadLink {
  zkeyFilename: string
  zkeyURL: string
}

/**
 * Map a circuit to its waiting queue
 * @typedef {Object} WaitingQueue
 * @property {string} ceremonyName - the name of the ceremony.
 * @property {string} circuitName - the name of the circuit.
 * @property {number} waitingQueue - the number of participants in the waiting queue.
 */
export interface WaitingQueue {
  ceremonyName: string 
  circuitName: string 
  waitingQueue: number 
}

/**
 * Define the data structure for a project.
 * @typedef {Object} Project
 * @property {CeremonyDocumentReferenceAndData} ceremony - the reference and data of the ceremony.
 * @property {Array<CircuitDocumentReferenceAndData>} [circuits] - the list of references and data of the circuits.
 * @property {Array<ParticipantDocumentReferenceAndData>} [participants] - the list of references and data of the participants.
 * @property {Array<ContributionDocumentReferenceAndData>} [contributions] - the list of references and data of the contributions.
 * @property {string} [coordinatorId] - the unique identifier of the coordinator.
 */
export interface Project {
  ceremony: CeremonyDocumentReferenceAndData
  circuits?: CircuitDocumentReferenceAndData[] | null
  participants?: ParticipantDocumentReferenceAndData[] | null
  contributions?: ContributionDocumentReferenceAndData[] | null
  coordinatorId?: string 
}

export interface State {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  circuit: CircuitDocumentReferenceAndData;
  setCircuit: React.Dispatch<React.SetStateAction<CircuitDocumentReferenceAndData>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  runTutorial: boolean;
  setRunTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  user?: string;
  setUser?: React.Dispatch<React.SetStateAction<string | undefined>>;
  waitingQueue: WaitingQueue[];
}

/**
 * Define the data structure for the project page context.
 * @typedef {Object} ProjectData
 * @property {string} ceremonyName - the name of the ceremony.
 * @property {string} ceremonyDescription - the description of the ceremony.
 * @property {string} ceremonyState - the state of the ceremony.
 * @property {string} ceremonyType - the type of the ceremony.
 */
export type ProjectData = z.infer<typeof ProjectDataSchema>;

/**
 * Define the data structure for the project page context.
 * @typedef {Object} ProjectPageContextProps
 * @property {boolean} hasUserContributed - true if the user has contributed to the project; otherwise false.
 * @property {ProjectData} projectData - the data about the project.
 * @property {boolean} isLoading - true if the data is being loaded; otherwise false.
 * @property {boolean} runTutorial - true if the tutorial should be run; otherwise false.
 * @property {string[]} [avatars] - the list of avatars for the participants.
 * @property {number} largestCircuitConstraints - the number of constraints of the largest circuit in the project.
 * @property {ZkeyDownloadLink[]} [finalZkeys] - the list of final zKeys for the project.
 * @property {FinalBeacon} [finalBeacon] - the beacon info for the final contribution.
 * @property {ZkeyDownloadLink[]} [latestZkeys] - the list of latest zKeys for the project.
 */
export type ProjectPageContextProps = {
  hasUserContributed: boolean
  projectData: ProjectData | null
  isLoading: boolean
  runTutorial: boolean
  avatars?: string[]
  largestCircuitConstraints: number
  finalZkeys?: ZkeyDownloadLink[]
  finalBeacon?: FinalBeacon
  latestZkeys?: ZkeyDownloadLink[]
};

export type StateProviderProps = {
  children: React.ReactNode;
};

/**
 * Define the data structure for the beacon info.
 * @typedef {Object} BeaconInfo
 * @property {string} value - the value of the beacon.
 * @property {string} hash - the hash of the beacon.
 */
export interface FinalBeacon {
  beacon: string 
  beaconHash: string
}
