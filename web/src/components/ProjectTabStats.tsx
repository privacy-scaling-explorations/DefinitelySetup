import {
  Box,
  SimpleGrid,
  TabPanel,
} from "@chakra-ui/react";

import { useProjectPageContext } from "../context/ProjectPageContext";

import { CircuitStats } from "../components/CircuitStats";

export const ProjectTabStats: React.FC = () => {
  const { circuitsClean } = useProjectPageContext();
  return (
    <TabPanel>
      <Box alignItems="center" alignSelf={"stretch"} w="full">
        <SimpleGrid
          alignSelf={"stretch"}
          maxW={["392px", "390px", "100%"]}
          columns={1}
          spacing={6}
        >
          {circuitsClean.map((circuit, index) =>
            <CircuitStats
              key={index}
              {...{circuit}}
            />
          )}
        </SimpleGrid>
      </Box>
    </TabPanel>
  );
}
