import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { StateContext } from "./StateContext";

export const ProjectDataSchema = z.object({
  name: z.string(),
  waitingQueue: z.number(),
  failedContributions: z.number(),
  completedContributions: z.number(),
  avgContributionTime: z.number(),
  diskSpaceRequired: z.string(),
  diskSpaceUnit: z.string(),
  lastContributorId: z.string(),
  zKeyIndex: z.string(),
  url: z.string(),
  content: z.string(),
  circuitName: z.string(),
  contributionHash: z.string()
});

export type ProjectData = z.infer<typeof ProjectDataSchema>;

export type ProjectPageContextProps = {
  projectData: ProjectData | null;
  isLoading: boolean;
};

const defaultProjectData: ProjectData = {
  name: "Ongoing Ceremony",
  waitingQueue: 5,
  failedContributions: 10,
  completedContributions: 15,
  avgContributionTime: 30,
  diskSpaceRequired: "10 GB",
  diskSpaceUnit: "GB",
  lastContributorId: "contributor123",
  zKeyIndex: "zKey456",
  url: "https://example.com",
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  circuitName: "Circuit ABC",
  contributionHash: "hash123"
};

const ProjectPageContext = createContext<ProjectPageContextProps>({
  projectData: defaultProjectData,
  isLoading: false
});

export const useProjectPageContext = () => useContext(ProjectPageContext);

type ProjectPageProviderProps = {
  children: React.ReactNode;
};

export const ProjectPageProvider: React.FC<ProjectPageProviderProps> = ({ children }) => {
  // const { projectId } = useParams();
  const navigate = useNavigate();
  const { loading: isLoading, setLoading: setIsLoading } = useContext(StateContext);

  const [projectData, setProjectData] = useState<ProjectData | null>(defaultProjectData);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock the response for now
        const response = await new Promise((resolve) =>
          setTimeout(() => resolve({ json: () => defaultProjectData }), 800)
        );
        //@ts-ignore
        const data = await response.json();
        console.log(data);
        const parsedData = ProjectDataSchema.parse(data);
        setProjectData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        navigate("/error");
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <ProjectPageContext.Provider value={{ projectData, isLoading }}>
      {children}
    </ProjectPageContext.Provider>
  );
};
