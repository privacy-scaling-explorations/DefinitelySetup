import React from "react"
import { Avatar, Box } from "@chakra-ui/react"

import { useProjectPageContext } from "../context/ProjectPageContext";

/**
 * Display the participants Avatars in a scrolling list
 */
const ScrollingAvatars: React.FC = () => {
    const {avatars} = useProjectPageContext();
    return (
      <Box
        maxW={"container.md"}
        width="50%"
        overflowX="auto"
        whiteSpace="nowrap"
        py={4}
        px={2}
        borderColor="gray.200"
      >
        {avatars && avatars.length > 0 && avatars.map((image: string, index: any) => (
          <Avatar
            key={index}
            src={image}
            mx={2}
          />
        ))}
      </Box>
    )
  }
  
export default ScrollingAvatars
