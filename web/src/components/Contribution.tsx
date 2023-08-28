import { Box, Button, Input, Text } from "@chakra-ui/react"
import React, { useState } from "react"
import { contribute } from "../helpers/p0tion"

export const Contribution = (props: any): React.JSX.Element => {

    const [ entropy, setEntropy ] = useState<string>("")
    const [ status, setStatus ] = useState<string[]>([])
    // const [ isLoading, setIsLoading ] = useState<boolean>(false)
    
    const ceremonyId = props.ceremonyId

    const handleChanges = (message: string, loading?: boolean) => {
        setStatus(prevStatus => [...prevStatus, message])
        if (loading) {}
        // if (isLoading === false && loading !== false) setIsLoading(loading!)
        // if (isLoading === true && loading !== true) setIsLoading(loading!)  
    }
    
    return (
        <>
            <Box width={"100%"} border="1px solid" borderColor={"white"} borderRadius={"md"}>     
                <Box width={"100%"} border="0px solid" borderColor="gray.300" borderRadius="md" p={2} textAlign={"center"}>
                    {
                        <Text fontSize={"large"} padding={"10px"}>Press contribute to contribute to the ceremony</Text>
                    }
                </Box>
                <Box width={"100%"} border="0px solid" borderColor="gray.300" borderRadius="md" p={2} textAlign={"center"}>
                    {
                        status.map((message, index) => {
                            return (
                                <>
                                    <Text fontSize={"large"} key={index} padding={"10px"}>{message}</Text> 
                                </>
                            )
                        })
                    }
                    {/* {isLoading && <Spinner />} */}
                </Box>
                <Input border="0px" width="80%" placeholder="Enter your Entropy" onChange={(e) => setEntropy(e.target.value)} />
                <Button width={"20%"} onClick={() => contribute(ceremonyId, entropy, handleChanges)}>
                    Contribute
                </Button>
            </Box>
        </>
    )
}