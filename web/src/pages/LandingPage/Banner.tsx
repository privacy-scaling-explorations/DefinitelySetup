import { FC } from "react";
import { Box, Text, HStack } from "@chakra-ui/react";

// Define the type for banner item props
interface BannerItemProps {
  imageUrl: string;
  altText: string;
  bannerText?: string;
}

// Define the type for scroll banner props
interface ScrollBannerProps {
  imageArray: BannerItemProps[];
}

// Create BannerItem component
const BannerItem: FC<BannerItemProps> = ({ bannerText }) => (
  <Box
    position="relative"
    mx={2}
    minWidth="750px"
    alignSelf={"stretch"}
    alignItems={"center"}
    justifyContent={"center"}
    h="40px"
    textAlign={"center"}
    // bg="red"
    display="flex"
  >
    <Text my="auto" color="gray.300" fontWeight="bold" fontSize={12}>
      {bannerText}
    </Text>
  </Box>
);


// Create ScrollBanner component
const ScrollBanner: FC<ScrollBannerProps> = ({ imageArray }) => {
  // Create a merged array to replicate the infinite loop
  const loopArray = [...imageArray, ...imageArray];

  return (
    <HStack
      overflow="hidden"
      p={0}
      
      w="97vw"
      spacing={0}
      alignSelf={"stretched"}
      maxH={"40px"}
      justifyContent={"center"}
      bg="#103241"
      alignItems={"center"}
      h="full"
    >
      <HStack

      p={0}
      
      w="calc(750px * 4)"
      spacing={0}
      alignSelf={"stretched"}
      maxH={"40px"}
      justifyContent={"center"}
      bg="#103241"
      alignItems={"center"}
      h="full"
      css={{
        animation: "marquee 10s linear infinite",
        "@keyframes marquee": {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(-30%, 0)" },
        }
      }}
    >



        {loopArray.map((item, index) => (
          <BannerItem key={index} {...item} />
        ))}

</HStack>
    </HStack>
  );
};

export { ScrollBanner, BannerItem };
