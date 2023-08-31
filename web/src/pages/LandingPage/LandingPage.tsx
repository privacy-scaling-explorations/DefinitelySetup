import React, { useContext } from "react";
import { StateContext } from "../../context/StateContext";
import { HeroComponent } from "./HeroComponent";
import SearchResults from "../../components/SearchResults";
import { CircularProgress } from "@chakra-ui/react";

const LandingPage: React.FC = () => {
  const { projects, waitingQueue, search, loading } = useContext(StateContext);

  if (loading) {
    return (
      <CircularProgress isIndeterminate color='green.300'>Fetching ceremonies...</CircularProgress>
    )
  }

  const render = search ? (
    <SearchResults />
  ) : (
    <HeroComponent
      projects={projects}
      waitingQueue={waitingQueue ?? []}
    ></HeroComponent>
  );
  return render;
};

export default LandingPage;
