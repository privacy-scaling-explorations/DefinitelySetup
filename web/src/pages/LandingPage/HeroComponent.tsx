import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Spacer,
  SimpleGrid
} from "@chakra-ui/react";
import { HeroComponentProps } from "../../helpers/interfaces";
import { ProjectCard } from "../../components/ProjectCard";
import { ScrollBanner } from "./Banner";

export function HeroComponent({ projects, waitingQueue }: HeroComponentProps) {
  const bannerImages: any[] = []
  const sortedProjects = projects.sort((a, b) => b.ceremony.data.endDate - a.ceremony.data.endDate);

  for (const queue of waitingQueue) {
    bannerImages.push({
      imageUrl: "https://res.cloudinary.com/pse-qf-maci/image/upload/v1690230945/Banner_qb6zlf.png",
      altText: queue.ceremonyName,
      bannerText: `${queue.ceremonyName} Waiting Queue for Circuit ${queue.circuitName}: ${
        queue.waitingQueue ?? "no circuits!"
      } `
    })    
  }
 
  return (
    <>
      <VStack p={0} w="full">
        <ScrollBanner imageArray={bannerImages} />
      </VStack>
      <VStack alignSelf={"stretch"} alignItems={"center"} spacing={8}>
        <Box
          className="tutorialLiveLook"
          alignItems="center"
          p={8}
          alignSelf={"stretch"}
          maxW={"container.sm"}
          mx="auto"
        >
          <HStack justifyContent={"space-between"} alignSelf={"stretch"}>
            <Heading size="md" mb={6} fontWeight={"bold"} letterSpacing={"3%"}>
              Ceremonies
            </Heading>
            <Spacer />
          </HStack>
          <VStack
            alignSelf={"stretch"}
            alignItems={"center"}
            justifyContent={"center"}
            spacing={8}
          ></VStack>
          <Box width="100%" px={8} py={0}>
            {projects.length > 0 ? (
              <SimpleGrid columns={[1, null, 1]} spacing={0}>
                {sortedProjects.map((project, index) => (
                  <ProjectCard key={index} project={project} />
                ))}
              </SimpleGrid>
            ) : (
              <Text>No ceremonies live yet!</Text>
            )}
          </Box>
        </Box>
      </VStack>
    </>
  );
}
