import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SurveyData, initialSurvey } from "./types";

type Ctx = {
  data: SurveyData;
  update: (patch: Partial<SurveyData>) => void;
  reset: () => void;
  refNumber: string | null;
  setRefNumber: (n: string) => void;
};

const SurveyCtx = createContext<Ctx | null>(null);

// Persist the in-progress survey to localStorage so a half-filled form survives
// an accidental refresh, tab close, or a failed submit on an unstable network.
const DRAFT_KEY = "survey-draft";

const freshSurvey = (): SurveyData => ({
  ...initialSurvey,
  surveyDate: new Date().toISOString().slice(0, 10),
});

const loadDraft = (): SurveyData => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...freshSurvey(), ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt draft */
  }
  return freshSurvey();
};

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SurveyData>(loadDraft);
  const [refNumber, setRefNumber] = useState<string | null>(null);

  // Save the draft on every change.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [data]);

  return (
    <SurveyCtx.Provider
      value={{
        data,
        update: (patch) => setData((d) => ({ ...d, ...patch })),
        reset: () => {
          try {
            localStorage.removeItem(DRAFT_KEY);
          } catch {
            /* ignore */
          }
          setData(freshSurvey());
        },
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
