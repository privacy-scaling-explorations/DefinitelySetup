// SearchResults.tsx

import { Box, SimpleGrid, Text } from "@chakra-ui/react";
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
    <Box mt={8} width="100%" p={8}>
      <Text mb={4}>{results.length} results found</Text>
      {results.length > 0 ? (
        <SimpleGrid columns={[1, null, 2]} spacing={10}>
          {results.map((project, index) => (
            // Render ProjectCard for each project in the results
            <ProjectCard key={index} project={project} />
          ))}
        </SimpleGrid>
      ) : (
        <Text>No results found.</Text>
      )}
    </Box>
  );
}
