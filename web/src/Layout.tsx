// Layout.tsx

import {
  VStack,
  Progress,
  HStack,
  Box,
  Text,
  Input,
  Button,
  Image,
  AspectRatio
} from "@chakra-ui/react";
import React, {  useEffect, useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { StateContext } from "./context/StateContext";
import {ColorModeSwitch} from './components/ColorModeSwitch';
import { FaGithub, FaHeart } from "react-icons/fa";

const Layout: React.FC<React.PropsWithChildren> = ({}) => {
  const { search, setSearch,loading, setLoading } = useContext(StateContext);

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
      <VStack height="100vh" overflow="scroll" minWidth="100%">
        {/* Show a loading progress bar if isLoading is true */}

        <HStack alignSelf="stretch" justifyContent="space-between" minH={"42px"} my={2} px={8}>
          <HStack as={Link} to="/" spacing="24px">
            <Box as={FaHeart} w={6} h={6} /> {/* Replace with your logo */}
            <Text>DefinitelySetup</Text>
          </HStack>
          <HStack spacing="24px">
            {/* Navigation links */}
            <Link to="/page1">Fork</Link>
            <Link to="/page2">About</Link>
            <Link to="/page3">Documentation</Link>
            <ColorModeSwitch />  {/* Add ColorModeSwitcher here */}
          </HStack>
        </HStack>
        <HStack
          alignSelf="stretch"
          justifyContent="space-between"
          minH={"42px"}
          my={2}
          px={8}
          alignItems={"center"}
        >
          {/* <Box>❤️</Box> Replace with your logo */}
          <AspectRatio w="40px" maxH="35px" ratio={1 / 2} borderRadius={"10px"} border={"4px"}>
            <Image
              boxSize="35px"
              objectFit="cover"
              src="https://media.tenor.com/ETVOuJOuNYIAAAAC/health-potion.gif"
              alt="Dan Abramov"
            />
          </AspectRatio>
          {/* Search input field */}
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button>Search</Button>
          <Button leftIcon={<Box as={FaGithub} w={4} h={4} />} variant="outline">
            Login
          </Button>
        </HStack>
        <Outlet />
      </VStack>
    </>
  );
};

export default Layout;
