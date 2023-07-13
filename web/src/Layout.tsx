// Layout.tsx

import {
  VStack,
  Progress,
  HStack,
  Box,
  Input,
  Button,
  Image,
  AspectRatio,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Heading,
  Spacer
} from "@chakra-ui/react";
import React, { useEffect, useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { StateContext } from "./context/StateContext";
import { ColorModeSwitch } from "./components/ColorModeSwitch";
import { FaHeart, FaSearch } from "react-icons/fa";

// eslint-ignore-next-line no-empty-pattern
const Layout: React.FC<React.PropsWithChildren> = ({}) => {
  const { search, setSearch, loading, setLoading } = useContext(StateContext);

  useEffect(() => console.log("searchL", search), [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <VStack alignSelf="stretch" width={"100%"}>
        <Progress
          size="sm"
          hasStripe
          width={"100%"}
          isIndeterminate={loading}
          bg={"linear-gradient(139deg, #fb8817, #ff4b01, #c12127, #e02aff)"}
          colorScheme="pink"
        />
      </VStack>
      <VStack minHeight="100vh" spacing={0}>
        {/* Show a loading progress bar if isLoading is true */}

        <HStack pb={2} pt={3} borderBottomWidth="1px"  alignSelf="stretch" justifyContent="space-between" minH={"42px"} alignItems={"center"} px={8}>
          <HStack as={Link} to="/" spacing="24px">
            <Box as={FaHeart} w={4} h={4} />
            <Heading fontWeight={"normal"} fontSize={14}>
              DefinitelySetup
            </Heading>
          </HStack>
          <HStack spacing="24px" fontSize={14}>
            {/* Navigation links */}
            <Heading as={Link} fontSize={14}  fontWeight={"normal"}  to="/page2">About</Heading>
            <Heading as={Link} fontSize={14} fontWeight={"normal"}   to="/page3">Documentation</Heading>
            <ColorModeSwitch />
          </HStack>
        </HStack>
        <HStack
          alignSelf="stretch"
          justifyContent="space-between"
        
          px={4}
          alignItems={"center"}
          pb={5}
          pt={5}
          shadow="md"
          // borderBottomWidth={1} borderColor={"gray.100"} 
        >
          <AspectRatio w="50px" maxH="50px" ratio={1 / 1} mx={4}>
            <Image
              boxSize="35px"
              objectFit="cover"
              src="https://res.cloudinary.com/pse-qf-maci/image/upload/v1689199506/logo-slow_vxtmkc.gif"
              alt="Dan Abramov"
            />
          </AspectRatio>
         {/* Search input field */}
         <InputGroup minH="50px">
            <InputLeftElement pointerEvents="none" minH="50px" >
              <Box as={FaSearch} w={4} h={4} color={"gray.600"} />
            </InputLeftElement>
            <Input minH="50px"
              borderColor={"transparent"}
              bg={"gray.100"}
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius={0}
              fontSize={14}
              color={"gray.600"}
            />
            <InputRightElement width="6.5rem" minH="50px"  >
              <Button  fontSize={14} width="6.5rem" variant="outline" borderRadius={0} borderColor={"transparent"} bg={"gray.800"} color={"gray.100"} minH="50px">Search</Button>
            </InputRightElement>
          </InputGroup>
    <Spacer minW={["15px","70px","70px"]} />
          {/* <Button leftIcon={<Box as={FaGithub} w={4} h={4} />} minWidth="6.5rem" minH="51.5px" borderRadius={0}  variant="outline" fontSize={14}>
            Login
          </Button> */}
        
        </HStack>
        <Outlet />
      </VStack>
    </>
  );
};

export default Layout;
