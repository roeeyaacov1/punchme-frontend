import { createContext, useContext } from "react";

export interface TabsState {
  value: string;
  select: (value: string) => void;
  /** A prefix for the ids that tie each tab to its panel. */
  idBase: string;
}

export const TabsContext = createContext<TabsState | null>(null);

export function useTabs(): TabsState {
  const tabs = useContext(TabsContext);
  if (!tabs) throw new Error("A Tab, TabList or TabPanel has to sit inside <Tabs>.");
  return tabs;
}
