import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { StateContext } from "./StateContext";
import { CeremonyTimeoutType, CeremonyState, CeremonyType } from "../helpers/interfaces";

export const ProjectDataSchema = z.object({
  ceremony: z.object({
    uid: z.string(),
    data: z.object({
      title: z.string(),
      description: z.string(),
      startDate: z.number(),
      endDate: z.number(),
      timeoutMechanismType: z.string(),
      penalty: z.number(),
      prefix: z.string(),
      state: z.string(),
      type: z.string(),
      coordinatorId: z.string(),
      lastUpdated: z.number()
    })
  }),
  circuits: z.optional(z.object({})),
  participants: z.optional(z.object({})),
  contributions: z.optional(z.object({}))
});

export type ProjectData = z.infer<typeof ProjectDataSchema>;

export type ProjectPageContextProps = {
  projectData: ProjectData | null;
  isLoading: boolean;
};

const defaultProjectData: ProjectData = {
  ceremony: {
    uid: "z37Z6PiCNPACp4gY9EMy",
    data: {
      title: "Ongoing ceremony",
      prefix: "example",
      description: "This is an example ceremony",
      startDate: new Date("2023-07-01").getTime(),
      endDate: new Date("2023-07-31").getTime(),
      timeoutMechanismType: CeremonyTimeoutType.FIXED,
      penalty: 3600,
      state: CeremonyState.OPENED,
      type: CeremonyType.PHASE2,
      coordinatorId: "uKm6XEjOKoeZUKAf2goY4vamgHE4",
      lastUpdated: Date.now()
    }
  }
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
        const response: any = await new Promise((resolve) =>
          setTimeout(() => resolve({ json: () => defaultProjectData }), 800)
        );

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
