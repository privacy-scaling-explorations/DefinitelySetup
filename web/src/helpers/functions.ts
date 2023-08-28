import { httpsCallable, httpsCallableFromURL } from "firebase/functions"
import { commonTerms } from "./constants"
import { firebaseFunctions } from "./firebase"
import { DocumentSnapshot, onSnapshot } from "firebase/firestore"
import { ETagWithPartNumber, FirebaseDocumentInfo } from "./interfaces"

/**
 * Return a pre-signed url for a given object contained inside the provided AWS S3 bucket in order to perform a GET request.
 * @param bucketName <string> - the name of the ceremony bucket.
 * @param objectKey <string> - the storage path that locates the artifact to be downloaded in the bucket.
 * @returns <Promise<string>> - the pre-signed url w/ GET request permissions for specified object key.
 */
export const generateGetObjectPreSignedUrl = async (
    bucketName: string,
    objectKey: string
): Promise<string> => {
    const cf = httpsCallable(firebaseFunctions, commonTerms.cloudFunctionsNames.generateGetObjectPreSignedUrl)

    const { data: getPreSignedUrl } = await cf({
        bucketName,
        objectKey
    })

    return String(getPreSignedUrl)
}

/**
 * Check the user's current participant status for the ceremony
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @returns <boolean> - true when participant is able to contribute; otherwise false.
 */
export const checkParticipantForCeremony = async (
    ceremonyId: string
    ): Promise<any> => {
    const cf = httpsCallable(firebaseFunctions, "checkParticipantForCeremony")

    const { data } = await cf({ ceremonyId })

    return data
}


/**
 * Progress the participant to the next circuit preparing for the next contribution.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 */
export const progressToNextCircuitForContribution = async (ceremonyId: string): Promise<void> => {
    const cf = httpsCallable(firebaseFunctions, "progressToNextCircuitForContribution")

    await cf({
        ceremonyId
    })
}

/**
 * Progress the participant to the next circuit preparing for the next contribution.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 */
export const progressToNextContributionStep = async (ceremonyId: string) => {
    const cf = httpsCallable(firebaseFunctions, commonTerms.cloudFunctionsNames.progressToNextContributionStep)

    await cf({
        ceremonyId
    })
}


/**
 * Write the information about current contribution hash and computation time for the current contributor.
 * @param functions <Functions> - the Firebase cloud functions object instance.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param contributionComputationTime <number> - the time when it was computed
 * @param contributingHash <string> - the hash of the contribution
 */
export const permanentlyStoreCurrentContributionTimeAndHash = async (
    ceremonyId: string,
    contributionComputationTime: number,
    contributionHash: string
) => {
    const cf = httpsCallable(firebaseFunctions, commonTerms.cloudFunctionsNames.permanentlyStoreCurrentContributionTimeAndHash)
    await cf({
        ceremonyId,
        contributionComputationTime,
        contributionHash
    })
}

/**
 * Start a new multi-part upload for a specific object in the given AWS S3 bucket.
 * @param bucketName <string> - the name of the ceremony bucket.
 * @param objectKey <string> - the storage path that locates the artifact to be downloaded in the bucket.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @returns Promise<string> - the multi-part upload id.
 */
export const openMultiPartUpload = async (
    bucketName: string,
    objectKey: string,
    ceremonyId?: string
): Promise<string> => {
    const cf = httpsCallable(firebaseFunctions, commonTerms.cloudFunctionsNames.startMultiPartUpload)

    const { data: uploadId } = await cf({
        bucketName,
        objectKey,
        ceremonyId
    })

    return String(uploadId)
}

/**
 * Write temporary information about the unique identifier about the opened multi-part upload to eventually resume the contribution.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param uploadId <string> - the unique identifier of the multi-part upload.
 */
export const temporaryStoreCurrentContributionMultiPartUploadId = async (
    ceremonyId: string,
    uploadId: string
) => {
    const cf = httpsCallable(
        firebaseFunctions,
        commonTerms.cloudFunctionsNames.temporaryStoreCurrentContributionMultiPartUploadId
    )

    await cf({
        ceremonyId,
        uploadId
    })
}


/**
 * Request to verify the newest contribution for the circuit.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param circuit <FirebaseDocumentInfo> - the document info about the circuit.
 * @param bucketName <string> - the name of the ceremony bucket.
 * @param contributorOrCoordinatorIdentifier <string> - the identifier of the contributor or coordinator (only when finalizing).
 * @param verifyContributionCloudFunctionEndpoint <string> - the endpoint (direct url) necessary to call the V2 Cloud Function.
 * @returns <Promise<void>> -
 */
export const verifyContribution = async (
    ceremonyId: string,
    circuit: FirebaseDocumentInfo, // any just to avoid breaking the tests.
    bucketName: string,
    contributorOrCoordinatorIdentifier: string,
    verifyContributionCloudFunctionEndpoint: string
): Promise<void> => {
    const cf = httpsCallableFromURL(firebaseFunctions, verifyContributionCloudFunctionEndpoint, {
        timeout: 3600000 // max timeout 60 minutes.
    })

    /**
     * @dev Force a race condition to fix #57.
     * TL;DR if the cloud function does not return despite having finished its execution, we use
     * a listener on the circuit, we check and retrieve the info about the correct execution and
     * return it manually. In other cases, it will be the function that returns either a timeout in case it
     * remains in execution for too long.
     */
    await Promise.race([
        cf({
            ceremonyId,
            circuitId: circuit.id,
            contributorOrCoordinatorIdentifier,
            bucketName
        }),
        new Promise((resolve): any => {
            setTimeout(() => {
                const unsubscribeToCeremonyCircuitListener = onSnapshot(
                    circuit.ref,
                    async (changedCircuit: DocumentSnapshot) => {
                        // Check data.
                        if (!circuit.data || !changedCircuit.data())
                            throw Error(`Unable to retrieve circuit data from the ceremony.`)

                        // Extract data.
                        const { avgTimings: changedAvgTimings, waitingQueue: changedWaitingQueue } =
                            changedCircuit.data()!
                        const {
                            contributionComputation: changedContributionComputation,
                            fullContribution: changedFullContribution,
                            verifyCloudFunction: changedVerifyCloudFunction
                        } = changedAvgTimings
                        const {
                            failedContributions: changedFailedContributions,
                            completedContributions: changedCompletedContributions
                        } = changedWaitingQueue

                        const { avgTimings: prevAvgTimings, waitingQueue: prevWaitingQueue } = changedCircuit.data()!
                        const {
                            contributionComputation: prevContributionComputation,
                            fullContribution: prevFullContribution,
                            verifyCloudFunction: prevVerifyCloudFunction
                        } = prevAvgTimings
                        const {
                            failedContributions: prevFailedContributions,
                            completedContributions: prevCompletedContributions
                        } = prevWaitingQueue

                        // Pre-conditions.
                        const invalidContribution = prevFailedContributions === changedFailedContributions - 1
                        const validContribution = prevCompletedContributions === changedCompletedContributions - 1
                        const avgTimeUpdates =
                            prevContributionComputation !== changedContributionComputation &&
                            prevFullContribution !== changedFullContribution &&
                            prevVerifyCloudFunction !== changedVerifyCloudFunction

                        if ((invalidContribution || validContribution) && avgTimeUpdates) {
                            resolve({})
                        }
                    }
                )

                // Unsubscribe from listener.
                unsubscribeToCeremonyCircuitListener()
            }, 3600000 - 1000) // 59:59 throws 1s before max time for CF execution.
        })
    ])
}

/**
 * Resume the contributor circuit contribution from scratch after the timeout expiration.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 */
export const resumeContributionAfterTimeoutExpiration = async (
    ceremonyId: string
): Promise<void> => {
    const cf = httpsCallable(firebaseFunctions, commonTerms.cloudFunctionsNames.resumeContributionAfterTimeoutExpiration)

    await cf({
        ceremonyId
    })
}

/**
 * Generate a new pre-signed url for each chunk related to a started multi-part upload.
 * @param bucketName <string> - the name of the ceremony bucket.
 * @param objectKey <string> - the storage path that locates the artifact to be downloaded in the bucket.
 * @param uploadId <string> - the unique identifier of the multi-part upload.
 * @param numberOfChunks <number> - the number of pre-signed urls to be generated.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @returns Promise<Array<string>> - the set of pre-signed urls (one for each chunk).
 */
export const generatePreSignedUrlsParts = async (
    bucketName: string,
    objectKey: string,
    uploadId: string,
    numberOfParts: number,
    ceremonyId?: string
): Promise<Array<string>> => {
    const cf = httpsCallable(firebaseFunctions, commonTerms.cloudFunctionsNames.generatePreSignedUrlsParts)

    const { data: chunksUrls }: any = await cf({
        bucketName,
        objectKey,
        uploadId,
        numberOfParts,
        ceremonyId
    })

    return chunksUrls
}

/**
 * Write temporary information about the etags and part numbers for each uploaded chunk in order to make the upload resumable from last chunk.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param chunk <ETagWithPartNumber> - the information about the already uploaded chunk.
 */
export const temporaryStoreCurrentContributionUploadedChunkData = async (
    ceremonyId: string,
    chunk: ETagWithPartNumber
) => {
    const cf = httpsCallable(
        firebaseFunctions,
        commonTerms.cloudFunctionsNames.temporaryStoreCurrentContributionUploadedChunkData
    )
    await cf({
        ceremonyId,
        chunk
    })
}

/**
 * Complete a multi-part upload for a specific object in the given AWS S3 bucket.
 * @param bucketName <string> - the name of the ceremony bucket.
 * @param objectKey <string> - the storage path that locates the artifact to be downloaded in the bucket.
 * @param uploadId <string> - the unique identifier of the multi-part upload.
 * @param parts Array<ETagWithPartNumber> - the completed .
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @returns Promise<string> - the location of the uploaded ceremony artifact.
 */
export const completeMultiPartUpload = async (
    bucketName: string,
    objectKey: string,
    uploadId: string,
    parts: Array<ETagWithPartNumber>,
    ceremonyId?: string
): Promise<string> => {
    // Call completeMultiPartUpload() Cloud Function.
    const cf = httpsCallable(firebaseFunctions, commonTerms.cloudFunctionsNames.completeMultiPartUpload)

    const { data: location }: any = await cf({
        bucketName,
        objectKey,
        uploadId,
        parts,
        ceremonyId
    })

    return String(location)
}