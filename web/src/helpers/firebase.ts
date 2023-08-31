import {
    collection as collectionRef,
    doc,
    DocumentData,
    DocumentSnapshot,
    Firestore,
    getDoc,
    getDocs,
    QueryDocumentSnapshot,
    getFirestore,
    query,
    collection,
    where,
    QueryConstraint,
    QuerySnapshot
} from "firebase/firestore"
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app" // ref https://firebase.google.com/docs/web/setup#access-firebase.
import { Functions, getFunctions } from "firebase/functions"
import { getContributionsCollectionPath, getParticipantsCollectionPath, getTimeoutsCollectionPath, processItems } from "./utils"
import { Auth, getAuth } from "firebase/auth"
import { FirebaseDocumentInfo, WaitingQueue } from "./interfaces"
import { apiKey, appId, authDomain, commonTerms, messagingSenderId, projectId } from "./constants"

// we init this here so we can use it throughout the functions below
export let firestoreDatabase: Firestore
export let firebaseApp: FirebaseApp
export let firebaseAuth: Auth
export let firebaseFunctions: Functions

/**
 * This method initialize a Firebase app if no other app has already been initialized.
 * @param options <FirebaseOptions> - an object w/ every necessary Firebase option to init app.
 * @returns <FirebaseApp> - the initialized Firebase app object.
 */
const initializeFirebaseApp = (options: FirebaseOptions): FirebaseApp => initializeApp(options)

/**
 * This method returns the Firestore database instance associated to the given Firebase application.
 * @param app <FirebaseApp> - the Firebase application.
 * @returns <Firestore> - the Firebase Firestore associated to the application.
 */
const getFirestoreDatabase = (app: FirebaseApp): Firestore => getFirestore(app)

/**
 * Get circuits collection path for database reference.
 * @notice all circuits related documents are store under `ceremonies/<ceremonyId>/circuits` collection path.
 * nb. This is a rule that must be satisfied. This is NOT an optional convention.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @returns <string> - the participants collection path.
 */
export const getCircuitsCollectionPath = (ceremonyId: string): string =>
    `${commonTerms.collections.ceremonies.name}/${ceremonyId}/${commonTerms.collections.circuits.name}`

/**
 * Return the core Firebase services instances (App, Database, Functions).
 * @param apiKey <string> - the API key specified in the application config.
 * @param authDomain <string> - the authDomain string specified in the application config.
 * @param projectId <string> - the projectId specified in the application config.
 * @param messagingSenderId <string> - the messagingSenderId specified in the application config.
 * @param appId <string> - the appId specified in the application config.
 * @returns <Promise<FirebaseServices>>
 */
export const initializeFirebaseCoreServices = async (): Promise<{
    firebaseApp: FirebaseApp
    firestoreDatabase: Firestore
    firebaseFunctions: Functions
}> => {
    const firebaseApp = initializeFirebaseApp({
        apiKey: apiKey,
        authDomain: authDomain,
        projectId: projectId,
        messagingSenderId: messagingSenderId,
        appId: appId
    })
    const firestoreDatabase = getFirestoreDatabase(firebaseApp)
    const firebaseFunctions = getFunctions(firebaseApp, "europe-west1")

    return {
        firebaseApp,
        firestoreDatabase,
        firebaseFunctions
    }
}

// Init the Firestore database instance.
(async () => {
    const { firestoreDatabase: db, firebaseApp: app, firebaseFunctions: functions } = await initializeFirebaseCoreServices()

    firestoreDatabase = db
    firebaseApp = app
    firebaseAuth = getAuth(app)
    firebaseFunctions = functions
})()

/**
 * Fetch for all documents in a collection.
 * @param firestoreDatabase <Firestore> - the Firestore service instance associated to the current Firebase application.
 * @param collection <string> - the name of the collection.
 * @returns <Promise<Array<QueryDocumentSnapshot<DocumentData>>>> - return all documents (if any).
 */
export const getAllCollectionDocs = async (
    collection: string
): Promise<Array<QueryDocumentSnapshot<DocumentData>>> =>
    (await getDocs(collectionRef(firestoreDatabase, collection))).docs

/**
 * Get a specific document from database.
 * @param firestoreDatabase <Firestore> - the Firestore service instance associated to the current Firebase application.
 * @param collection <string> - the name of the collection.
 * @param documentId <string> - the unique identifier of the document in the collection.
 * @returns <Promise<DocumentSnapshot<DocumentData>>> - return the document from Firestore.
 */
export const getDocumentById = async (
    collection: string,
    documentId: string
): Promise<DocumentSnapshot<DocumentData>> => {
    const docRef = doc(firestoreDatabase, collection, documentId)

    return getDoc(docRef)
}

/**
 * Helper for obtaining uid and data for query document snapshots.
 * @param queryDocSnap <Array<QueryDocumentSnapshot>> - the array of query document snapshot to be converted.
 * @returns Array<FirebaseDocumentInfo>
 */
export const fromQueryToFirebaseDocumentInfo = (
    queryDocSnap: Array<QueryDocumentSnapshot>
): Array<any> =>
    queryDocSnap.map((document: QueryDocumentSnapshot<DocumentData>) => ({
        id: document.id,
        ref: document.ref,
        data: document.data()
    }))

/**
 * Query for ceremony circuits.
 * @notice the order by sequence position is fundamental to maintain parallelism among contributions for different circuits.
 * @param firestoreDatabase <Firestore> - the Firestore service instance associated to the current Firebase application.
 * @param ceremonyId <string> - the ceremony unique identifier.
 * @returns Promise<Array<FirebaseDocumentInfo>> - the ceremony' circuits documents ordered by sequence position.
 */
export const getCeremonyCircuits = async (
    ceremonyId: string
): Promise<Array<any>> =>
    fromQueryToFirebaseDocumentInfo(
        await getAllCollectionDocs(getCircuitsCollectionPath(ceremonyId))
    ).sort((a: any, b: any) => a.data.sequencePosition - b.data.sequencePosition)


/**
 * Fetch all avatars for participants of a ceremony.
 * @param ceremonyId {string} - the ceremony unique identifier.
 * @returns {string[]} - An array of avatarURLs. 
 */
export const getParticipantsAvatar = async (
    ceremonyId: string,
): Promise<any> => {
    // Get all participants of the ceremony
    const participantsDocs = await getAllCollectionDocs(`ceremonies/${ceremonyId}/participants`)
    const participantsData = fromQueryToFirebaseDocumentInfo(participantsDocs)

    // Get the IDs of the participants
    const participantIds = participantsData.map(participant => participant.id)

    // Chunk the IDs into groups of 10 or fewer due to Firestore's limitation
    const chunks: any[] = []
    while (participantIds.length) {
        chunks.push(participantIds.splice(0, 10))
    }

    // This function fetches avatars for a given chunk
    const fetchAvatarsForChunk = async (chunk: string[]): Promise<string[]> => {
        const q = query(
            collection(firestoreDatabase, 'avatars'),
            where('__name__', 'in', chunk)
        );

        const avatarDocs = await getDocs(q)

        return avatarDocs.docs
            .filter(doc => doc.exists())
            .map(doc => doc.data().avatarUrl)
    };

    // Process all the chunks concurrently
    // @todo do something with the errors - for now ignore them
    const { results } = await processItems(chunks, fetchAvatarsForChunk, false)
    // Flattening the list of lists of avatar URLs
    const avatarURLs = results.flat()

    return avatarURLs
}


/**
 * Function to get contributions for each circuit
 * @param {Firestore} firestoreDatabase - the Firestore service instance associated to the current Firebase application.
 * @param {string} circuitId - the circuit unique identifier.
 * @param {string} ceremonyId - the ceremony unique identifier.
 * @returns {Array<any>} - An array of contributions for the circuit.
*/ 
export const getContributions = async (
    ceremonyId: string,
    circuitId: string
): Promise<any[]> => {
    const contributionsDocs = await getAllCollectionDocs(`ceremonies/${ceremonyId}/circuits/${circuitId}/contributions`);
    return contributionsDocs.map((document: DocumentData) => ({ uid: document.id, data: document.data() }));
}

/**
 * Check and return the circuit document based on its sequence position among a set of circuits (if any).
 * @dev there should be only one circuit with a provided sequence position. This method checks and return an
 * error if none is found.
 * @param circuits <Array<FirebaseDocumentInfo>> - the set of ceremony circuits documents.
 * @param sequencePosition <number> - the sequence position (index) of the circuit to be found and returned.
 * @returns <FirebaseDocumentInfo> - the document of the circuit in the set of circuits that has the provided sequence position.
 */
export const getCircuitBySequencePosition = (
    circuits: Array<FirebaseDocumentInfo>,
    sequencePosition: number
): FirebaseDocumentInfo => {
    // Filter by sequence position.
    const matchedCircuits = circuits.filter(
        (circuitDocument: FirebaseDocumentInfo) => circuitDocument.data.sequencePosition === sequencePosition
    )

    if (matchedCircuits.length !== 1)
        throw new Error(
            `Unable to find the circuit having position ${sequencePosition}. Run the command again and, if this error persists please contact the coordinator.`
        )

    return matchedCircuits[0]!
}


/**
 * Return the most up-to-date data about the participant document for the given ceremony.
 * @param firestoreDatabase <Firestore> - the Firestore service instance associated to the current Firebase application.
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param participantId <string> - the unique identifier of the participant.
 * @returns <Promise<DocumentData>> - the most up-to-date participant data.
 */
export const getLatestUpdatesFromParticipant = async (
    ceremonyId: string,
    participantId: string
): Promise<DocumentData> => {
    // Fetch participant data.
    const participant = await getDocumentById(
        getParticipantsCollectionPath(ceremonyId),
        participantId
    )

    if (!participant.data()) return {}

    return participant.data()!
}

/**
 * Helper for query a collection based on certain constraints.
 * @param collection <string> - the name of the collection.
 * @param queryConstraints <Array<QueryConstraint>> - a sequence of where conditions.
 * @returns <Promise<QuerySnapshot<DocumentData>>> - return the matching documents (if any).
 */
export const queryCollection = async (
    collection: string,
    queryConstraints: Array<QueryConstraint>
): Promise<QuerySnapshot<DocumentData>> => {
    // Make a query.
    const q = query(collectionRef(firestoreDatabase, collection), ...queryConstraints)

    // Get docs.
    const snap = await getDocs(q)

    return snap
}

/**
 * Query for a specific ceremony' circuit contribution from a given contributor (if any).
 * @notice if the caller is a coordinator, there could be more than one contribution (= the one from finalization applies to this criteria).
 * @param ceremonyId <string> - the unique identifier of the ceremony.
 * @param circuitId <string> - the unique identifier of the circuit.
 * @param participantId <string> - the unique identifier of the participant.
 * @returns <Promise<Array<FirebaseDocumentInfo>>> - the document info about the circuit contributions from contributor.
 */
export const getCircuitContributionsFromContributor = async (
    ceremonyId: string,
    circuitId: string,
    participantId: string
): Promise<Array<FirebaseDocumentInfo>> => {
    const participantContributionsQuerySnap = await queryCollection(
        getContributionsCollectionPath(ceremonyId, circuitId),
        [where(commonTerms.collections.contributions.fields.participantId, "==", participantId)]
    )

    return fromQueryToFirebaseDocumentInfo(participantContributionsQuerySnap.docs)
}


/**
 * Query for the active timeout from given participant for a given ceremony (if any).
 * @param ceremonyId <string> - the identifier of the ceremony.
 * @param participantId <string> - the identifier of the participant.
 * @returns <Promise<Array<FirebaseDocumentInfo>>> - the document info about the current active participant timeout.
 */
export const getCurrentActiveParticipantTimeout = async (
    ceremonyId: string,
    participantId: string
): Promise<Array<FirebaseDocumentInfo>> => {
    const participantTimeoutQuerySnap = await queryCollection(
        getTimeoutsCollectionPath(ceremonyId, participantId),
        [where(commonTerms.collections.timeouts.fields.endDate, ">=", Date.now())]
    )

    return fromQueryToFirebaseDocumentInfo(participantTimeoutQuerySnap.docs)
}

/**
 * Get how many users in the waiting queue per circuit
 * @param ceremonyId {string} - the ceremony unique identifier.
 * @param ceremonyName {string} - the ceremony name.
 * @returns {WaitingQueue[]}
 */
export const getCeremonyCircuitsWaitingQueue = async (
    ceremonyId: string,
    ceremonyName: string
): Promise<WaitingQueue[]> => {
    const circuits = await getCeremonyCircuits(ceremonyId)

    const waiting: WaitingQueue[] = []
    for (const circuit of circuits) {
        const { waitingQueue, name } = circuit.data 
        const { contributors } = waitingQueue 

        waiting.push({
            ceremonyName: ceremonyName,
            circuitName: name,
            waitingQueue: contributors.length
        })
    }

    return waiting 
}