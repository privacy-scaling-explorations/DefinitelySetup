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
        target: ".contributeCopyButton",
        content: "Here you can copy the command needed to contribute to this ceremony",
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
        target: ".detailsButton",
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
 * @returns {any} - the results and errors
 */
export const processItems = async (items: (any[] | any)[], process: any): Promise<any> => {
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
            // we want to be able to accept arguments as arrays of single items
            if (Array.isArray(item)) results.push(await process(...item))
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