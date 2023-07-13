// SearchResults.tsx

import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { StateContext } from "../context/StateContext";
import { ProjectCard } from "./ProjectCard";
import { useContext, useEffect } from "react";

export default function SearchResults() {
  const { projects, search } = useContext(StateContext);

  useEffect(() => console.log("search", search), [search]);

  // console.log("search for", search)
  const results = projects.filter((project) =>
    project.ceremony.data.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VStack minH={"100vh"}>
      <HStack p={4} minW={"100vw"} alignItems={"center"}  alignSelf={"stretch"}  bg="gray.100">
        <Text >{results.length} results found</Text>
      </HStack>
      <HStack  alignItems={"flex-start"} alignSelf={"stretch"}>
        <VStack  minW={["0px", "150px"]} justifyContent={"flex-start"} alignSelf={"stretch"}></VStack>
        <Box width="100%" px={8} py={0}>
          {results.length > 0 ? (
            <SimpleGrid columns={[1, null, 1]} spacing={0}>
              {results.map((project, index) => (
                // Render ProjectCard for each project in the results
                <ProjectCard key={index} project={project} />
              ))}
            </SimpleGrid>
          ) : (
            <Text>No results found.</Text>
          )}
        </Box>
      </HStack>
    </VStack>
  );
}
