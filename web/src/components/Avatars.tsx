import React from "react"
import { Avatar, Box } from "@chakra-ui/react"

interface ScrollingAvatarsProps {
    images?: string[]
  }
  
/**
 * Display the participants Avatars in a scrolling list
 * @param {ScrollingAvatarsProps} - the images to show
 */
const ScrollingAvatars: React.FC<ScrollingAvatarsProps> = ({ images }) => {
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
        {images && images.length > 0 && images.map((image: string, index: any) => (
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