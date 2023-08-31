import { getAuth } from "firebase/auth";
import { commonTerms, finalContributionIndex, genesisZkeyIndex, localPaths, minFollowers, minFollowing, minRepos } from "./constants";
import {firebaseApp, getCeremonyCircuits, getCircuitContributionsFromContributor, getCircuitsCollectionPath, getDocumentById } from "./firebase";
import { completeMultiPartUpload, generateGetObjectPreSignedUrl, generatePreSignedUrlsParts, openMultiPartUpload, temporaryStoreCurrentContributionMultiPartUploadId, temporaryStoreCurrentContributionUploadedChunkData } from "./functions";
import { ChunkWithUrl, Contribution, ContributionValidity, ETagWithPartNumber, FirebaseDocumentInfo, TemporaryParticipantContributionData, Timing } from "./interfaces";
import { request } from "@octokit/request"

export function truncateString(str: string, numCharacters = 5): string {
    if (str.length <= numCharacters * 2) {
        return str;
    }
    
    const firstPart = str.slice(0, numCharacters);
    const lastPart = str.slice(-numCharacters);
    
    return `${firstPart}...${lastPart}`;
}
    
export function parseDate(dateString: number): string {
    const parsedDate = new Date(dateString);
    return parsedDate.toDateString();
}
    
export const formatDate = (date: Date): string =>
    `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(
        2,
        "0"
    )}.${String(date.getFullYear()).slice(-2)}`;
    
export function bytesToMegabytes(bytes: number): number {
    return bytes / Math.pow(1024, 2);
}

export function toBackgroundImagefromSrc(src: string) {
    return "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('" + src + "')";
}

// Get a human-readable string indicating how far in the future or past a date is
export const getTimeDifference = (date: Date): string => {
    const currentDate = new Date();
    const differenceInTime = date.getTime() - currentDate.getTime();
    const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));
  
    if (differenceInDays < 0) return `${Math.abs(differenceInDays)} days ago`;
    if (differenceInDays > 0) return `${differenceInDays} days from now`;
    return "Today";
  };

// steps for the tutorial on the search bar
export const searchBarSteps =  [
    {
        target: ".tutorialSearchBar",
        content: "Search for your favorite setup",
    }
]

// steps for the tutorial on the projects page
export const projectsPageSteps =  [
    {
        target: ".tutorialDescription",
        content: "Here you can find a description of the project",
    },
    {
        target: ".tutorialButtons",
        content: "Click here to read the instructions on how to contribute or watch a live ceremony",
    },
    {
        target: ".tutorialLiveLook",
        content: "Here you can see the live status of a ceremony",
    },
    {
        target: ".tutorialContributionsList",
        content: "Here you can see the list of contributions to this ceremony",
    }
]

// steps for the tutorial on the single project details page
export const singleProjectPageSteps = [
    {
        target: ".loginButton",
        content: "Click Login here to be able to contribute via your Browser"
    },
    {
        target: ".contributeCopyButton",
        content: "Here you can copy the command needed to contribute to this ceremony",
    },
    {
        target: ".browserContributeCopyButton",
        content: "Here you can contribute to the ceremony directly on your Browser"
    },
    {
        target: ".circuitsView",
        content: "Here you can see the circuits for this ceremony and their live statistics",
    },
    {
        target: ".contributionsButton",
        content: "Click here to view the completed contributions",
    },
    {
        target: ".linksButton",
        content: "Click here to view the details of this circuit",
    },
    {
        target: ".zKeyNavigationButton",
        content: "Click here to download the final zKey for this circuit (only if the ceremony has been finalized)",
    }
]

/**
 * Execute in batches of 25 different processes.
 * @param items {any} the items to process
 * @param process {any} the process function to apply to each item
 * @param unwrap {boolean} whether to unwrap the args or not
 * @returns {any} - the results and errors
 */
export const processItems = async (
    items: (any[] | any)[], 
    process: any,
    unwrap: boolean = false
): Promise<any> => {
    // we store the errors and the results
    const errors: any = []
    const results: any = []

    // index starts at 0 (first args to process)
    let index: number = 0
    
    // recursively execute the function on the items
    const exec = async (): Promise<any> => {
        if (index === items.length) return 
        const item = items[index++]

        // store results
        try { 
            if (unwrap) results.push(await process(...item))
            else results.push(await process(item))
        }
        catch (error) { errors.push(error) }

        // call itself
        return exec() 
    }

    // create workers
    const workers = Array.from( { length: Math.min(items.length, 50) }, exec)

    // run all workers
    await Promise.all(workers)
    return { results, errors }
}

/**
 * Transform a number in a zKey index format.
 * @dev this method is aligned with the number of characters of the genesis zKey index (which is a constant).
 * @param progress <number> - the progression in zKey index.
 * @returns <string> - the progression in a zKey index format (`XYZAB`).
 */
export const formatZkeyIndex = (progress: number): string => {
    let index = progress.toString()

    // Pad with zeros if the progression has less digits.
    while (index.length < genesisZkeyIndex.length) {
        index = `0${index}`
    }

    return index
}

/**
 * Get zKey file path tied to a particular circuit of a ceremony in the storage.
 * @notice each zKey file in the storage must be stored in the following path: `circuits/<circuitPrefix>/contributions/<completeZkeyFilename>`.
 * nb. This is a rule that must be satisfied. This is NOT an optional convention.
 * @param circuitPrefix <string> - the prefix of the circuit.
 * @param completeZkeyFilename <string> - the complete zKey filename (name + ext).
 * @returns <string> - the storage path of the zKey file.
 */
export const getZkeyStorageFilePath = (circuitPrefix: string, completeZkeyFilename: string): string =>
    `${"circuits"}/${circuitPrefix}/${"contributions"}/${completeZkeyFilename}`


/**
 * Get the complete contribution file path.
 * @param completeFilename <string> - the complete filename of the file (name.ext).
 * @returns <string> - the complete contribution path to the file.
 */
export const getContributionLocalFilePath = (completeFilename: string): string =>
    `${localPaths.contributions}/${completeFilename}`


/**
 * Return the bucket name based on ceremony prefix.
 * @param ceremonyPrefix <string> - the ceremony prefix.
 * @param ceremonyPostfix <string> - the ceremony postfix.
 * @returns <string>
 */
export const getBucketName = (ceremonyPrefix: string, ceremonyPostfix: string): string =>
    `${ceremonyPrefix}${ceremonyPostfix}`


/**
 * Download an artifact from the ceremony bucket.
 * @dev this method request a pre-signed url to make a GET request to download the artifact.
 * @param bucketName <string> - the name of the ceremony artifacts bucket (AWS S3).
 * @param storagePath <string> - the storage path that locates the artifact to be downloaded in the bucket.
 */
export const downloadCeremonyArtifact = async (
    bucketName: string,
    storagePath: string,
    setStatus: (message: string, loading?: boolean, attestationLink?: string) => void
): Promise<Uint8Array> => {
    // Request pre-signed url to make GET download request.
    const getPreSignedUrl = await generateGetObjectPreSignedUrl(bucketName, storagePath)

    const response = await fetch(getPreSignedUrl);
    const totalLength = Number(response.headers.get("Content-Length"))

    if (!response.body) throw Error("ReadableStream not yet supported in this browser.")

    const reader = response.body.getReader()
    let chunks: Uint8Array[] = []
    let receivedLength = 0

    while (true) {
        const { done, value } = await reader.read()

        if (done) break
        

        chunks.push(value!)
        receivedLength += value!.length

        setStatus(`Downloading: (${(receivedLength / totalLength * 100).toFixed(2)}%)`, true)
    }

    let chunksAll = new Uint8Array(receivedLength)
    let position = 0;

    for (let chunk of chunks) {
        chunksAll.set(chunk, position)
        position += chunk.length
    }

    return chunksAll
}


/**
 * Get participants collection path for database reference.
 * @notice all participants related documents are store under `ceremonies/<ceremonyId>/participants` collection path.
 * nb. This is a rule that must be satisfied. This is NOT an optional convention.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @returns <string> - the participants collection path.
 */
export const getParticipantsCollectionPath = (ceremonyId: string): string =>
    `${commonTerms.collections.ceremonies.name}/${ceremonyId}/${commonTerms.collections.participants.name}`

/**
 * Get contributions collection path for database reference.
 * @notice all contributions related documents are store under `ceremonies/<ceremonyId>/circuits/<circuitId>/contributions` collection path.
 * nb. This is a rule that must be satisfied. This is NOT an optional convention.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param circuitId <string> - the unique identifier of the circuit.
 * @returns <string> - the contributions collection path.
 */
export const getContributionsCollectionPath = (ceremonyId: string, circuitId: string): string =>
    `${getCircuitsCollectionPath(ceremonyId)}/${circuitId}/${commonTerms.collections.contributions.name}`


/**
 * Get timeouts collection path for database reference.
 * @notice all timeouts related documents are store under `ceremonies/<ceremonyId>/participants/<participantId>/timeouts` collection path.
 * nb. This is a rule that must be satisfied. This is NOT an optional convention.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the participant.
 * @returns <string> - the timeouts collection path.
 */
export const getTimeoutsCollectionPath = (ceremonyId: string, participantId: string): string =>
    `${getParticipantsCollectionPath(ceremonyId)}/${participantId}/${commonTerms.collections.timeouts.name}`


/**
 * Function from snarkjs to format a hash.
 * @param b 
 * @param title 
 * @returns {string} - the contribution hash
 */
export function formatHash(b: any, title: any) {
    const a = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let S = "";
    for (let i=0; i<4; i++) {
        if (i>0) S += "\n";
        S += "\t\t";
        for (let j=0; j<4; j++) {
            if (j>0) S += " ";
            S += a.getUint32(i*16+j*4).toString(16).padStart(8, "0");
        }
    }
    if (title) S = title + "\n" + S;
    return S;
}


export const getChunksAndPreSignedUrls = async (
    bucketName: string,
    objectKey: string,
    fileContent: Uint8Array,  // The file content as a string
    uploadId: string,
    configStreamChunkSize: number = 25,
    ceremonyId?: string
    ): Promise<Array<ChunkWithUrl>> => {
    // Calculate the number of chunks
    const chunkSize = configStreamChunkSize * 1024 * 1024 
    const numChunks = Math.ceil(fileContent.length / chunkSize)

    // Split fileData into chunks
    const chunks = Array.from({ length: numChunks }, (_, i) =>
        fileContent.subarray(i * chunkSize, (i + 1) * chunkSize)
    )

    // Check if the file is not empty
    if (!chunks.length) throw new Error("Unable to split an empty file into chunks.");
    
    // Request pre-signed URL generation for each chunk
    const preSignedUrls: Array<string> = await generatePreSignedUrlsParts(
        bucketName,
        objectKey,
        uploadId,
        chunks.length,
        ceremonyId
    )

    // Map pre-signed URLs with corresponding chunks
    return chunks.map((val1, index) => ({
        partNumber: index + 1,
        chunk: val1,
        preSignedUrl: preSignedUrls[index],
    }))
}

/**
 * Forward the request to upload each single chunk of the related ceremony artifact.
 * @param chunksWithUrls <Array<ChunkWithUrl>> - the array containing each chunk mapped with the corresponding pre-signed urls.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param alreadyUploadedChunks Array<ETagWithPartNumber> - the temporary information about the already uploaded chunks.
 * @returns <Promise<Array<ETagWithPartNumber>>> - the completed (uploaded) chunks information.
 */
export const uploadParts = async (
    chunksWithUrls: Array<ChunkWithUrl>,
    setStatus: (message: string, loading?: boolean, attestationLink?: string) => void,
    ceremonyId?: string,
    alreadyUploadedChunks?: Array<ETagWithPartNumber>,
): Promise<Array<ETagWithPartNumber>> => {
    // Keep track of uploaded chunks.
    const uploadedChunks: Array<ETagWithPartNumber> = alreadyUploadedChunks || []

    const totalChunks = chunksWithUrls.length

    // Loop through remaining chunks.
    for (let i = alreadyUploadedChunks ? alreadyUploadedChunks.length : 0; i < chunksWithUrls.length; i += 1) {
        setStatus(`Uploading chunk ${i + 1} of ${totalChunks}...`, true)
        // Consume the pre-signed url to upload the chunk.
        // @ts-ignore
        const response = await fetch(chunksWithUrls[i].preSignedUrl, {
            method: "PUT",
            body: chunksWithUrls[i].chunk,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Length": chunksWithUrls[i].chunk.length.toString()
            },
        })

        // Verify the response.
        if (response.status !== 200 || !response.ok)
            throw new Error(
                `Unable to upload chunk number ${i}. Please, terminate the current session and retry to resume from the latest uploaded chunk.`
            )

        // Extract uploaded chunk data.
        const chunk = {
            ETag: response.headers.get("etag") || undefined,
            PartNumber: chunksWithUrls[i].partNumber
        }
        uploadedChunks.push(chunk)

        setStatus(`Uploaded chunk ${i + 1} of ${totalChunks}`, true)

        // Temporary store uploaded chunk data to enable later resumable contribution.
        // nb. this must be done only when contributing (not finalizing).
        if (!!ceremonyId)
            await temporaryStoreCurrentContributionUploadedChunkData(ceremonyId, chunk)
    }

    return uploadedChunks
}
  


/**
 * Upload a ceremony artifact to the corresponding bucket.
 * @notice this method implements the multi-part upload using pre-signed urls, optimal for large files.
 * Steps:
 * 0) Check if current contributor could resume a multi-part upload.
 *    0.A) If yes, continue from last uploaded chunk using the already opened multi-part upload.
 *    0.B) Otherwise, start creating a new multi-part upload.
 * 1) Generate a pre-signed url for each (remaining) chunk of the ceremony artifact.
 * 2) Consume the pre-signed urls to upload chunks.
 * 3) Complete the multi-part upload.
 * @param cloudFunctions <Functions> - the Firebase Cloud Functions service instance.
 * @param bucketName <string> - the name of the ceremony artifacts bucket (AWS S3).
 * @param objectKey <string> - the unique key to identify the object inside the given AWS S3 bucket.
 * @param localPath <string> - the local path where the artifact will be downloaded.
 * @param configStreamChunkSize <number> - size of each chunk into which the artifact is going to be splitted (nb. will be converted in MB).
 * @param [ceremonyId] <string> - the unique identifier of the ceremony (used as a double-edge sword - as identifier and as a check if current contributor is the coordinator finalizing the ceremony).
 * @param [temporaryDataToResumeMultiPartUpload] <TemporaryParticipantContributionData> - the temporary information necessary to resume an already started multi-part upload.
 */
export const multiPartUpload = async (
    bucketName: string,
    objectKey: string,
    fileData: Uint8Array,
    setStatus: (message: string, loading?: boolean, attestationLink?: string) => void,
    ceremonyId?: string,
    temporaryDataToResumeMultiPartUpload?: TemporaryParticipantContributionData
) => {
    // The unique identifier of the multi-part upload.
    let multiPartUploadId: string = ""
    // The list of already uploaded chunks.
    let alreadyUploadedChunks: Array<ETagWithPartNumber> = []

    // Step (0).
    if (temporaryDataToResumeMultiPartUpload && !!temporaryDataToResumeMultiPartUpload.uploadId) {
        // Step (0.A).
        multiPartUploadId = temporaryDataToResumeMultiPartUpload.uploadId
        alreadyUploadedChunks = temporaryDataToResumeMultiPartUpload.chunks
    } else {
        // Step (0.B).
        // Open a new multi-part upload for the ceremony artifact.
        multiPartUploadId = await openMultiPartUpload(bucketName, objectKey, ceremonyId)

        // Store multi-part upload identifier on document collection.
        if (ceremonyId)
            // Store Multi-Part Upload ID after generation.
            await temporaryStoreCurrentContributionMultiPartUploadId(ceremonyId!, multiPartUploadId)
    }

    // Step (1).
    const chunksWithUrlsZkey = await getChunksAndPreSignedUrls(
        bucketName,
        objectKey,
        fileData,
        multiPartUploadId,
        25,
        ceremonyId
    )

    // Step (2).
    const partNumbersAndETagsZkey = await uploadParts(
        chunksWithUrlsZkey,
        setStatus,
        ceremonyId,
        alreadyUploadedChunks
    )

    // Step (3).
    await completeMultiPartUpload(
        bucketName,
        objectKey,
        multiPartUploadId,
        partNumbersAndETagsZkey,
        ceremonyId
    )
}

export const sleep = async (time: number) => {
    await new Promise(resolve => setTimeout(resolve, time))
}

/**
 * Get seconds, minutes, hours and days from milliseconds.
 * @param millis <number> - the amount of milliseconds.
 * @returns <Timing> - a custom object containing the amount of seconds, minutes, hours and days in the provided millis.
 */
export const getSecondsMinutesHoursFromMillis = (millis: number): Timing => {
    let delta = millis / 1000

    const days = Math.floor(delta / 86400)
    delta -= days * 86400

    const hours = Math.floor(delta / 3600) % 24
    delta -= hours * 3600

    const minutes = Math.floor(delta / 60) % 60
    delta -= minutes * 60

    const seconds = Math.floor(delta) % 60

    return {
        seconds: seconds >= 60 ? 59 : seconds,
        minutes: minutes >= 60 ? 59 : minutes,
        hours: hours >= 24 ? 23 : hours,
        days
    }
}

/**
 * Return a string with double digits if the provided input is one digit only.
 * @param in <number> - the input number to be converted.
 * @returns <string> - the two digits stringified number derived from the conversion.
 */
export const convertToDoubleDigits = (amount: number): string => (amount < 10 ? `0${amount}` : amount.toString())

/**
 * Get the validity of contributors' contributions for each circuit of the given ceremony (if any).
 * @param circuits <Array<FirebaseDocumentInfo>> - the array of ceremony circuits documents.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the contributor.
 * @param isFinalizing <boolean> - flag to discriminate between ceremony finalization (true) and contribution (false).
 * @returns <Promise<Array<ContributionValidity>>> - a list of contributor contributions together with contribution validity (based on coordinator verification).
 */
export const getContributionsValidityForContributor = async (
    circuits: Array<FirebaseDocumentInfo>,
    ceremonyId: string,
    participantId: string,
    isFinalizing: boolean
): Promise<Array<ContributionValidity>> => {
    const contributionsValidity: Array<ContributionValidity> = []

    for await (const circuit of circuits) {
        // Get circuit contribution from contributor.
        const circuitContributionsFromContributor = await getCircuitContributionsFromContributor(
            ceremonyId,
            circuit.id,
            participantId
        )

        // Check for ceremony finalization (= there could be more than one contribution).
        const contribution = isFinalizing
            ? circuitContributionsFromContributor
                  .filter(
                      (contributionDocument: FirebaseDocumentInfo) =>
                          contributionDocument.data.zkeyIndex === finalContributionIndex
                  )
                [0]
            : circuitContributionsFromContributor[0]

        if (!contribution)
            throw new Error(
                "Unable to retrieve contributions for the participant. There may have occurred a database-side error. Please, we kindly ask you to terminate the current session and repeat the process"
            )

        contributionsValidity.push({
            contributionId: contribution?.id,
            circuitId: circuit.id,
            valid: contribution?.data.valid
        })
    }

    return contributionsValidity
}

/**
 * Display and manage data necessary when participant has already made the contribution for all circuits of a ceremony.
 * @param circuits <Array<FirebaseDocumentInfo>> - the array of ceremony circuits documents.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the contributor.
 */
export const handleContributionValidity = async (
    circuits: Array<FirebaseDocumentInfo>,
    ceremonyId: string,
    participantId: string,
    setStatus: (message: string, loading?: boolean, attestationLink?: string) => void
) => {
    // Get contributors' contributions validity.
    const contributionsWithValidity = await getContributionsValidityForContributor(
        circuits,
        ceremonyId,
        participantId,
        false
    )

    // Filter only valid contributions.
    const validContributions = contributionsWithValidity.filter(
        (contributionWithValidity: ContributionValidity) => contributionWithValidity.valid
    )

    if (!validContributions.length)
        setStatus("You have provided some invalid contributions")
    else {
        setStatus("You have provided valid contributions for all circuits")
    }
}

/**
 * Return the public attestation preamble for given contributor.
 * @param contributorIdentifier <string> - the identifier of the contributor (handle, name, uid).
 * @param ceremonyName <string> - the name of the ceremony.
 * @param isFinalizing <boolean> - true when the coordinator is finalizing the ceremony, otherwise false.
 * @returns <string> - the public attestation preamble.
 */
export const getPublicAttestationPreambleForContributor = (
    contributorIdentifier: string,
    ceremonyName: string,
    isFinalizing: boolean
) =>
    `Hey, I'm ${contributorIdentifier} and I have ${
        isFinalizing ? "finalized" : "contributed to"
    } the ${ceremonyName}${ceremonyName.toLowerCase().includes('trusted setup') || ceremonyName.toLowerCase().includes("ceremony") ? "." : " MPC Phase2 Trusted Setup ceremony."}\nThe following are my contribution signatures:`


/**
 * Check and prepare public attestation for the contributor made only of its valid contributions.
 * @param circuits <Array<FirebaseDocumentInfo>> - the array of ceremony circuits documents.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the contributor.
 * @param participantContributions <Array<Co> - the document data of the participant.
 * @param contributorIdentifier <string> - the identifier of the contributor (handle, name, uid).
 * @param ceremonyName <string> - the name of the ceremony.
 * @param isFinalizing <boolean> - true when the coordinator is finalizing the ceremony, otherwise false.
 * @returns <Promise<string>> - the public attestation for the contributor.
 */
export const generateValidContributionsAttestation = async (
    circuits: Array<FirebaseDocumentInfo>,
    ceremonyId: string,
    participantId: string,
    participantContributions: Array<Contribution>,
    contributorIdentifier: string,
    ceremonyName: string,
    isFinalizing: boolean
): Promise<string> => {
    // Generate the attestation preamble for the contributor.
    let publicAttestation = getPublicAttestationPreambleForContributor(
        contributorIdentifier,
        ceremonyName,
        isFinalizing
    )

    // Get contributors' contributions validity.
    const contributionsWithValidity = await getContributionsValidityForContributor(
        circuits,
        ceremonyId,
        participantId,
        isFinalizing
    )

    for await (const contributionWithValidity of contributionsWithValidity) {
        // Filter for the related contribution document info.
        const matchedContributions = participantContributions.filter(
            (contribution: Contribution) => contribution.doc === contributionWithValidity.contributionId
        )

        if (matchedContributions.length === 0)
            throw new Error(
                `Unable to retrieve given circuit contribution information. This could happen due to some errors while writing the information on the database.`
            )

        if (matchedContributions.length > 1)
            throw new Error(`Duplicated circuit contribution information. Please, contact the coordinator.`)

        const participantContribution = matchedContributions[0]

        // Get circuit document (the one for which the contribution was calculated).
        const circuitDocument = await getDocumentById(
            getCircuitsCollectionPath(ceremonyId),
            contributionWithValidity.circuitId
        )
        const contributionDocument = await getDocumentById(
            getContributionsCollectionPath(ceremonyId, contributionWithValidity.circuitId),
            participantContribution.doc
        )

        if (!contributionDocument.data() || !circuitDocument.data())
            throw new Error(`Something went wrong when retrieving the data from the database`)

        // Extract data.
        const { sequencePosition, prefix } = circuitDocument.data()!
        const { zkeyIndex } = contributionDocument.data()!

        // Update public attestation.
        publicAttestation = `${publicAttestation}\n\nCircuit # ${sequencePosition} (${prefix})\nContributor # ${
            zkeyIndex > 0 ? Number(zkeyIndex) : zkeyIndex
        }\n${participantContribution.hash}`
    }

    return publicAttestation
}

/**
 * Generate the public attestation for the contributor.
 * @param circuits <Array<FirebaseDocumentInfo>> - the array of ceremony circuits documents.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the contributor.
 * @param participantContributions <Array<Co> - the document data of the participant.
 * @param contributorIdentifier <string> - the identifier of the contributor (handle, name, uid).
 * @param ceremonyName <string> - the name of the ceremony.
 * @returns <Promise<string>> - the public attestation.
 */
export const generatePublicAttestation = async (
    circuits: Array<FirebaseDocumentInfo>,
    ceremonyId: string,
    participantId: string,
    participantContributions: Array<Contribution>,
    contributorIdentifier: string,
    ceremonyName: string,
    setStatus: (message: string, loading?: boolean, attestationLink?: string) => void
): Promise<string> => {
    // Display contribution validity.
    await handleContributionValidity(circuits, ceremonyId, participantId, setStatus)

    await sleep(3000)

    // Get only valid contribution hashes.
    return generateValidContributionsAttestation(
        circuits,
        ceremonyId,
        participantId,
        participantContributions,
        contributorIdentifier,
        ceremonyName,
        false
    )
}

/**
 * Publish public attestation using Github Gist.
 * @dev the contributor must have agreed to provide 'gist' access during the execution of the 'auth' command.
 * @param accessToken <string> - the contributor access token.
 * @param publicAttestation <string> - the public attestation.
 * @param ceremonyTitle <string> - the ceremony title.
 * @param ceremonyPrefix <string> - the ceremony prefix.
 * @returns <Promise<string>> - the url where the gist has been published.
 */
export const publishGist = async (
    token: string,
    content: string,
    ceremonyTitle: string,
    ceremonyPrefix: string
): Promise<string> => {
    const response = await request("POST /gists", {
        description: `Attestation for ${ceremonyTitle} MPC Phase 2 Trusted Setup ceremony`,
        public: true,
        files: {
            [`${ceremonyPrefix}_${commonTerms.foldersAndPathsTerms.attestation}.log`]: {
                content
            }
        },
        
        headers: {
            authorization: `token ${token}`
        }
    })

    if (response.status !== 201 || !response.data.html_url)
        throw new Error("Cannot publish gist")

    return response.data.html_url!
}

/**
 * Generate a custom url that when clicked allows you to compose a tweet ready to be shared.
 * @param ceremonyName <string> - the name of the ceremony.
 * @param gistUrl <string> - the url of the gist where the public attestation has been shared.
 * @param isFinalizing <boolean> - flag to discriminate between ceremony finalization (true) and contribution (false).
 * @returns <string> - the ready to share tweet url.
 */
export const generateCustomUrlToTweetAboutParticipation = (
    ceremonyName: string,
    gistUrl: string,
    isFinalizing: boolean
) =>
    isFinalizing
        ? `https://twitter.com/intent/tweet?text=I%20have%20finalized%20the%20${ceremonyName}${ceremonyName.toLowerCase().includes("trusted") || ceremonyName.toLowerCase().includes("setup") || ceremonyName.toLowerCase().includes("phase2") || ceremonyName.toLowerCase().includes("ceremony") ? "!" : "%20Phase%202%20Trusted%20Setup%20ceremony!"}%20You%20can%20view%20my%20final%20attestation%20here:%20${gistUrl}%20#Ethereum%20#ZKP%20#PSE`
        : `https://twitter.com/intent/tweet?text=I%20contributed%20to%20the%20${ceremonyName}${ceremonyName.toLowerCase().includes("trusted") || ceremonyName.toLowerCase().includes("setup") || ceremonyName.toLowerCase().includes("phase2") || ceremonyName.toLowerCase().includes("ceremony") ? "!" : "%20Phase%202%20Trusted%20Setup%20ceremony!"}%20You%20can%20view%20the%20steps%20to%20contribute%20here:%20https://ceremony.pse.dev%20You%20can%20view%20my%20attestation%20here:%20${gistUrl}%20#Ethereum%20#ZKP`


/**
 * Generate a ready-to-share tweet on public attestation.
 * @param ceremonyTitle <string> - the title of the ceremony.
 * @param gistUrl <string> - the Github public attestation gist url.
 */
export const handleTweetGeneration = async (ceremonyTitle: string, gistUrl: string): Promise<string> => {
    // Generate a ready to share custom url to tweet about ceremony participation.
    const tweetUrl = generateCustomUrlToTweetAboutParticipation(ceremonyTitle, gistUrl, false)

    // Automatically open a webpage with the tweet.
    return tweetUrl
}

/**
 * Get the information associated to the account from which the token has been generated to
 * create a custom unique identifier for the user.
 * @notice the unique identifier has the following form 'handle-identifier'.
 * @param githubToken <string> - the Github token.
 * @returns <Promise<any>> - the Github (provider) unique identifier associated to the user.
 */
export const getGithubProviderUserId = async (githubToken: string): Promise<string | null> => {
    const response = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
            Authorization: `token ${githubToken}`
        }
    })

    if (response && response.status === 200) {
        const data = await response.json(); // Parsing the JSON data
        if (data && data.login && typeof data.id !== 'undefined') {
            return `${data.login}-${data.id}`
        }
        throw new Error("Data is incomplete")
    }

    throw new Error("No token or failed request")
}

/**
 * Check if a user already contributed to this ceremony
 * @param ceremonyId {string} - the ceremony id 
 * @returns {boolean}
 */
export const checkIfUserContributed = async (ceremonyId: string): Promise<boolean> => {
    const user = getAuth(firebaseApp).currentUser
    if (!user) return false 
    const circuits = await getCeremonyCircuits(ceremonyId)
    for (const circuit of circuits) {
        const hasContributed = await getCircuitContributionsFromContributor(ceremonyId, circuit.id, user.uid)
        if (hasContributed.length === 0) return false 
    }
    return true        
}

/**
 * Get the largest constraints of a circuit
 * @param array {any[]|undefined}
 * @returns {number}
 */
export const findLargestConstraint = (array: any[]|undefined): number => {
    if (!array) return 0
    return array.reduce((max: any, current: any) => {
        const constraint = current.data.metadata?.constraints ?? 0
        return Math.max(max, constraint)
    }, 0)
}

/**
 * Check if the user is reputable enough to contribute to a ceremony
 * @param username {string} 
 * @returns 
 */
export const checkGitHubReputation = async (): Promise<boolean> => {
    const resp = await fetch(`https://api.github.com/user`, {
        headers: {
            Authorization: `token ${localStorage.getItem("token")}`
        }
    })

    if (resp.status !== 200) return false

    const data = await resp.json()

    if (data.public_repos < minRepos) return false
    if (data.followers < minFollowers) return false
    if (data.following < minFollowing) return false

    return true 
}