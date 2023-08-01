import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { StateProvider } from "./context/StateContext";
// import { LandingPageProvider } from "./context/LandingPageContext";
import { ProjectPageProvider } from "./context/ProjectPageContext";
// import SearchResults from "./components/SearchResults";
import ProjectPage from "./pages/ProjectPage";
import LandingPage from "./pages/LandingPage/LandingPage";

function App() {
  return (
    <Router>
      <StateProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Render the SearchResults component for the index route */}
              <Route index element={<LandingPage />} />
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
      </StateProvider>
    </Router>
  );
}

export default App;
