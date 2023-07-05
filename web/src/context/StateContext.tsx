// useStateContext.tsx

import React, { useState, createContext } from "react";

export interface Project {
  ceremonyName: string;
  description: string;
  startDate: string;
  endDate: string;
  timeoutThreshold: number;
  fixed: boolean;
  threshold: number;
  circomVersion: string;
  githubCircomTemplate: string;
  commitHash: string;
  paramsArray: string[];
}

export interface State {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StateContext = createContext<State>({
  projects: [
    // Initial project data
    {
      ceremonyName: "example",
      description: "This is an example ceremony",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 10,
      circomVersion: "0.5.1",
      githubCircomTemplate: "github.com/circom/template",
      commitHash: "1234567890",
      paramsArray: ["param1", "param2", "param3"]
    }
  ],
  setProjects: () => null,
  search: "",
  setSearch: () => null,
  loading: false,
  setLoading: () => null
});

export const useInitialStateContext = () => {
  const [projects, setProjects] = useState<Project[]>([
    // Initial project data
    {
      ceremonyName: "@semaphore-protocol-example",
      description: "This is an example ceremony",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 10,
      circomVersion: "0.5.1",
      githubCircomTemplate: "github.com/circom/template",
      commitHash: "1234567890",
      paramsArray: ["param1", "param2", "param3"]
    },
    {
      ceremonyName: "@maci-protocol-example",
      description: "This is an example ceremony",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 10,
      circomVersion: "0.5.1",
      githubCircomTemplate: "github.com/circom/template",
      commitHash: "1234567890",
      paramsArray: ["param1", "param2", "param3"]
    },
    {
      ceremonyName: "@rln-example",
      description: "This is an example ceremony",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 10,
      circomVersion: "0.5.1",
      githubCircomTemplate: "github.com/circom/template",
      commitHash: "1234567890",
      paramsArray: ["param1", "param2", "param3"]
    },
    {
      ceremonyName: "@zkecdsa-example",
      description: "This is an example ceremony",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 10,
      circomVersion: "0.5.1",
      githubCircomTemplate: "github.com/circom/template",
      commitHash: "1234567890",
      paramsArray: ["param1", "param2", "param3"]
    },
    {
      ceremonyName: "ShadowedChain",
      description: "Enhanced privacy for blockchain transactions",
      startDate: "2024-01-02",
      endDate: "2024-02-02",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 30,
      circomVersion: "1.3.0",
      githubCircomTemplate: "github.com/ShadowedChain/circom",
      commitHash: "d9e7f8a0b1c2",
      paramsArray: ["zkSNARKS", "privacy", "blockchain"]
    },
    {
      ceremonyName: "SilentLedger",
      description: "The silent, yet transparent ledger system",
      startDate: "2024-02-03",
      endDate: "2024-03-03",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 35,
      circomVersion: "1.4.0",
      githubCircomTemplate: "github.com/SilentLedger/circom",
      commitHash: "e1f2a3b4c5d6",
      paramsArray: ["cryptography", "zkSNARKs", "transparency"]
    },
    {
      ceremonyName: "InvisibleInk",
      description: "Secure, hidden messages on blockchain",
      startDate: "2024-03-04",
      endDate: "2024-04-04",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 40,
      circomVersion: "1.5.0",
      githubCircomTemplate: "github.com/InvisibleInk/circom",
      commitHash: "f1e2d3c4b5a6",
      paramsArray: ["zkSNARKS", "security", "communication"]
    },
    {
      ceremonyName: "CovertContracts",
      description: "Private smart contracts on blockchain",
      startDate: "2024-04-05",
      endDate: "2024-05-05",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 45,
      circomVersion: "1.6.0",
      githubCircomTemplate: "github.com/CovertContracts/circom",
      commitHash: "a1b2c3d4e5f6",
      paramsArray: ["smart contracts", "privacy", "zkSNARKS"]
    },
    {
      ceremonyName: "ObscureOps",
      description: "Secure operations with zkSNARKs",
      startDate: "2024-05-06",
      endDate: "2024-06-06",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 50,
      circomVersion: "1.7.0",
      githubCircomTemplate: "github.com/ObscureOps/circom",
      commitHash: "b1a2c3d4e5f6",
      paramsArray: ["zkSNARKS", "operations", "security"]
    },
    {
      ceremonyName: "BlindBlocks",
      description: "Creating blocks unseen, but fully verifiable",
      startDate: "2024-06-07",
      endDate: "2024-07-07",
      timeoutThreshold: 3600,
      fixed: true,
      threshold: 55,
      circomVersion: "1.8.0",
      githubCircomTemplate: "github.com/BlindBlocks/circom",
      commitHash: "c1a2b3d4e5f6",
      paramsArray: ["zkSNARKS", "block creation", "verifiability"]
    }
  ]);

  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  return { projects, setProjects, search, setSearch, loading, setLoading };
};
