import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import ProjectPage from "./pages/ProjectPage";
import { ProjectPageProvider } from "./context/ProjectPageContext";
import { StateContext, useInitialStateContext } from "./context/StateContext";
import SearchResults from "./components/SearchResults";

function App() {
  const stateContext = useInitialStateContext();

  return (
    <Router>
      <StateContext.Provider value={stateContext}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Render the SearchResults component for the index route */}
            <Route index element={<SearchResults />} />
            {/* Render the ProjectPage component for the "projects/:title" route */}
            <Route
              path="projects/:ceremonyName"
              element={
                <ProjectPageProvider>
                  <ProjectPage />
                </ProjectPageProvider>
              }
            />
          </Route>
        </Routes>
      </StateContext.Provider>
    </Router>
  );
}

export default App;
