import { createContext, useContext, useState, ReactNode } from "react";
import { SurveyData, initialSurvey } from "./types";

type Ctx = {
  data: SurveyData;
  update: (patch: Partial<SurveyData>) => void;
  reset: () => void;
  refNumber: string | null;
  setRefNumber: (n: string) => void;
};

const SurveyCtx = createContext<Ctx | null>(null);

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SurveyData>({
    ...initialSurvey,
    surveyDate: new Date().toISOString().slice(0, 10),
  });
  const [refNumber, setRefNumber] = useState<string | null>(null);
  return (
    <SurveyCtx.Provider
      value={{
        data,
        update: (patch) => setData((d) => ({ ...d, ...patch })),
        reset: () => setData({ ...initialSurvey, surveyDate: new Date().toISOString().slice(0, 10) }),
        refNumber,
        setRefNumber,
      }}
    >
      {children}
    </SurveyCtx.Provider>
  );
};

export const useSurvey = () => {
  const ctx = useContext(SurveyCtx);
  if (!ctx) throw new Error("useSurvey must be inside SurveyProvider");
  return ctx;
};
