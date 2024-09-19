import React, { useState, useEffect } from "react";
import {
  Box,
  HStack,
  TabPanel,
  Tag,
  Heading,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  Select,
  Skeleton,
  Stack,
} from "@chakra-ui/react";

import { useProjectPageContext } from "../context/ProjectPageContext";

export const ProjectTabContributions: React.FC = () => {
  const { contributionsClean } = useProjectPageContext();
  const [currentPage, setCurrentPage] = useState('');
  const [currentItems, setCurrentItems] = useState([]);

  useEffect(() => {
    setCurrentPage(Object.keys(contributionsClean)[0]);
  }, [ contributionsClean ]);

  useEffect(() => {
    if(!(currentPage in contributionsClean)) {
      setCurrentItems([]);
      return;
    }
    setCurrentItems(contributionsClean[currentPage].sort((a, b) => {
      const docA = a.doc.toLowerCase()
      const docB = b.doc.toLowerCase()

      if (docA < docB) return -1
      if (docA > docB) return 1
      return 0
    }));
  }, [ currentPage ]);

  return (
    <TabPanel alignSelf={"stretch"}>
      <HStack justifyContent={"space-between"} alignSelf={"stretch"}>
        <Heading fontSize="18" mb={6} fontWeight={"bold"} letterSpacing={"3%"}>
          Contributions
        </Heading>
        <Spacer />
      </HStack>
      <Box overflowX="auto">
        {!contributionsClean ? (
          <Stack>
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </Stack>
        ) : (<>
          <Select
            onChange={(e) => setCurrentPage(e.target.value)}
            value={currentPage}
          >
            {Object.keys(contributionsClean).map(circuit => (
              <option
                key={circuit}
                value={circuit}
              >
                {circuit}
              </option>
            ))}
          </Select>
          <Table fontSize={12} variant="simple">
            <Thead>
              <Tr>
                <Th>Doc</Th>
                <Th>Contribution Date</Th>
                <Th>Hashes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems?.map((contribution, index) => (
                <Tr key={index}>
                  <Td>{contribution.doc}</Td>
                  <Td>{contribution.lastUpdated}</Td>
                  <Td>
                    <Tooltip
                      label={contribution.lastZkeyBlake2bHash}
                      aria-label="Last Zkey Hash"
                    >
                      <Tag fontSize={12}>{contribution.lastZkeyBlake2bHash}</Tag>
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>)}
      </Box>
    </TabPanel>
  );
}
