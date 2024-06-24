import { Box, Button, Grid, GridItem, Spinner, Text } from "@chakra-ui/react"
import React, { useState } from "react"
import { contribute } from "../helpers/p0tion"
//import { getCeremonyCircuits } from "../helpers/firebase"

/**
 * Components that allows to contribute to a ceremony on the browser
 * @param props 
 * @returns 
 */
export const Contribution = (props: any): React.JSX.Element => {
    const [ status, setStatus ] = useState<string>("")
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ attestationLink, setAttestationLink ] = useState<string>("")
    const [ circuits, setCircuits ] = useState<any[]>([])
    
    const ceremonyId = props.ceremonyId

    // Get list of circuits for this ceremony
    // useEffect(() => {
    //     console.log(`contrib component: get ceremony`)
    //     getCeremonyCircuits(ceremonyId).then(ccts => 
    //         setCircuits(ccts))
    // }, [ceremonyId])

    // function that is passed to the contribute function to update the status of the contribution
    const handleChanges = (message: string, loading?: boolean, attestationLink?: string, circuitProgress?: any[]) => {
        console.log(`handleChanges ${typeof circuitProgress}`)
        setStatus(message)
        if (typeof loading === 'boolean') setIsLoading(loading)
        if (typeof attestationLink === 'string') {
            setAttestationLink(attestationLink)
        }
        if (typeof circuitProgress === 'object') setCircuits(circuitProgress)
    }

    const circuitStatusGrid = (): JSX.Element[] => {
        let items: JSX.Element[] = []
        circuits.forEach((c,i) => {
            let bg
            switch(c.state) {
                case 1:
                    bg = 'yellow.300'
                    break
                case 2: 
                    bg = 'green.500'
                    break
                default:
                    bg = 'gray.700'
            }
            items.push(<GridItem key={i} bg={bg}>{c.sequence}</GridItem>)
        })
        return (items) 
    }
    
    return (
        <>
            <Box maxW={"container.md"} width={"100%"} border="1px solid" borderColor={"gray.500"} borderRadius={"md"} textAlign={"center"}>     
                <Box width={"100%"} border="0px solid" borderColor="gray.300" borderRadius="md" p={2} textAlign={"center"}>
                    {
                        status === "" &&
                        <Text p={4} fontSize={"large"}>Press contribute to join the ceremony</Text>
                    }
                    <Text p={4} fontSize={"medium"}>If contributing on your phone, please do not leave the current browser tab</Text>
                </Box>
                <Grid>
                    { circuitStatusGrid() }
                </Grid>
                <Box p={4} width={"100%"} border="0px solid" borderColor="gray.300" borderRadius="md" textAlign={"center"}>
                    <Text p={4} fontSize={"large"} padding={"10px"}>{status}</Text>
                    {isLoading && <Spinner color="green" />}
                </Box>
                {
                    status === "" &&
                    <Button p={4} width="100%" color={"red"} onClick={() => contribute(ceremonyId, handleChanges)}>
                        Contribute
                    </Button>
                }
                {
                    attestationLink &&
                    <a href={attestationLink} target="_blank" rel="noreferrer">
                        <Button p={4} width="100%" color={"red"}>
                            Attestation
                        </Button>
                    </a>
                }
            </Box>
        </>
    )
}