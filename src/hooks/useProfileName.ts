import { createContext, useContext } from "react";

const ProfileNameContext = createContext<string>("");

export const ProfileNameProvider = ProfileNameContext.Provider;

export function useProfileName(): string {
  return useContext(ProfileNameContext);
}
