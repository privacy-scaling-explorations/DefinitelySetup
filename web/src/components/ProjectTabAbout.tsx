import {
  Box,
  VStack,
  SimpleGrid,
  TabPanel,
} from "@chakra-ui/react";

import { useProjectPageContext } from "../context/ProjectPageContext";
import { CircuitAbout } from "../components/CircuitAbout";

export const ProjectTabAbout: React.FC = () => {
  const { circuitsClean } = useProjectPageContext();
  return (
    <TabPanel>
      <VStack
        alignSelf={"stretch"}
        alignItems={"center"}
        justifyContent={"center"}
        spacing={8}
        py={0}
      >
        <Box alignItems="center" alignSelf={"stretch"} w="full">
          <SimpleGrid
            alignSelf={"stretch"}
            maxW={["392px", "390px", "100%"]}
            columns={1}
            spacing={6}
          >
            {circuitsClean.map((circuit, index) => (
              <CircuitAbout
                key={index}
                {...{circuit}}
              />
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </TabPanel>
  );
}
