import type { AppMenuId } from "@/lib/ui/theme";
import type { ResearchThemenBlock } from "@/lib/research/themenBlocks";
import type { WebResearchProviderId } from "@/lib/research/webResearchProviders";
import type { BrainstormIdea } from "@/lib/brainstorm/contentPillars";
import type { PlanDiffSummary } from "@/lib/planDiff";
import type {
  ContentBriefing,
  CreatorReferenceSuggestion,
  LoopAnalysisResult,
  ProductionGuide,
  ProgressEntry,
  ResearchResult,
  WizardAnswers,
  Zyklus,
} from "@/lib/types";

export type FlowPhase =
  | "setup"
  | "wizard"
  | "briefing"
  | "brainstorm"
  | "research"
  | "plan"
  | "production"
  | "done";

export interface PersistedFlow {
  phase: FlowPhase;
  menu: AppMenuId;
  nische: string;
  referentCreator: string;
  answers: WizardAnswers;
  creatorSuggestion: CreatorReferenceSuggestion | null;
  briefing: ContentBriefing | null;
  research: (ResearchResult & { researchNotizen?: string }) | null;
  researchCycle: number;
  researchThemen: ResearchThemenBlock[];
  researchWebProvider?: WebResearchProviderId;
  brainstormIdeas: BrainstormIdea[];
  calendars: Zyklus[];
  activeCalendarId: string | null;
  zyklus: Zyklus | null;
  productionGuide: ProductionGuide | null;
  progressLog: ProgressEntry[];
  recordedIds: string[];
  learnings: LoopAnalysisResult | null;
  planDiff: PlanDiffSummary | null;
  planVersion: 1 | 2;
}

export interface AccountMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsRegistry {
  activeId: string;
  accounts: AccountMeta[];
}

/** Früherer Single-Slot — wird beim ersten Start migriert. */
export const LEGACY_FLOW_STORAGE_KEY = "contentpilot.flow.v1";

const REGISTRY_KEY = "contentpilot.accounts.v1";

function flowStorageKey(accountId: string): string {
  return `contentpilot.flow.v1.${accountId}`;
}

function newAccountId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `acc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function deriveAccountName(flow: Partial<PersistedFlow>): string {
  const fromBriefing =
    flow.briefing?.praezisierteNische?.trim() ||
    flow.briefing?.nische?.trim();
  if (fromBriefing) return fromBriefing.slice(0, 48);
  const fromNische = flow.nische?.trim();
  if (fromNische) return fromNische.slice(0, 48);
  const mon = flow.zyklus?.monat ?? flow.calendars?.[0]?.monat;
  if (mon) return `Plan ${mon}`;
  return "Neuer Account";
}

export function emptyPersistedFlow(): PersistedFlow {
  return {
    phase: "setup",
    menu: "calendar",
    nische: "",
    referentCreator: "",
    answers: {
      zielgruppeDetail: "",
      contentZiel30Tage: "",
      formatPraeferenz: "",
      noGos: "",
      zeitBudgetProWoche: "",
    },
    creatorSuggestion: null,
    briefing: null,
    research: null,
    researchCycle: 1,
    researchThemen: [],
    researchWebProvider: "auto",
    brainstormIdeas: [],
    calendars: [],
    activeCalendarId: null,
    zyklus: null,
    productionGuide: null,
    progressLog: [],
    recordedIds: [],
    learnings: null,
    planDiff: null,
    planVersion: 1,
  };
}

function readRegistry(): AccountsRegistry | null {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AccountsRegistry;
  } catch {
    return null;
  }
}

function writeRegistry(registry: AccountsRegistry): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

export function loadFlowForAccount(accountId: string): PersistedFlow | null {
  try {
    const raw = localStorage.getItem(flowStorageKey(accountId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedFlow;
  } catch {
    return null;
  }
}

export function saveFlowForAccount(
  accountId: string,
  flow: PersistedFlow
): void {
  localStorage.setItem(flowStorageKey(accountId), JSON.stringify(flow));
  const registry = readRegistry();
  if (!registry) return;
  const i = registry.accounts.findIndex((a) => a.id === accountId);
  if (i < 0) return;
  const name = deriveAccountName(flow);
  registry.accounts[i] = {
    ...registry.accounts[i],
    name,
    updatedAt: nowIso(),
  };
  writeRegistry(registry);
}

function migrateLegacySingleFlow(): AccountsRegistry | null {
  try {
    const raw = localStorage.getItem(LEGACY_FLOW_STORAGE_KEY);
    if (!raw) return null;
    const flow = JSON.parse(raw) as PersistedFlow;
    const id = newAccountId();
    const t = nowIso();
    const registry: AccountsRegistry = {
      activeId: id,
      accounts: [
        {
          id,
          name: deriveAccountName(flow),
          createdAt: t,
          updatedAt: t,
        },
      ],
    };
    localStorage.setItem(flowStorageKey(id), raw);
    localStorage.removeItem(LEGACY_FLOW_STORAGE_KEY);
    writeRegistry(registry);
    return registry;
  } catch {
    return null;
  }
}

export function ensureAccountsRegistry(): AccountsRegistry {
  const existing = readRegistry();
  if (existing?.accounts.length && existing.activeId) return existing;

  const migrated = migrateLegacySingleFlow();
  if (migrated) return migrated;

  const id = newAccountId();
  const t = nowIso();
  const registry: AccountsRegistry = {
    activeId: id,
    accounts: [
      {
        id,
        name: "Neuer Account",
        createdAt: t,
        updatedAt: t,
      },
    ],
  };
  writeRegistry(registry);
  saveFlowForAccount(id, emptyPersistedFlow());
  return registry;
}

export function setActiveAccountInRegistry(activeId: string): AccountsRegistry {
  const registry = ensureAccountsRegistry();
  if (!registry.accounts.some((a) => a.id === activeId)) return registry;
  registry.activeId = activeId;
  writeRegistry(registry);
  return registry;
}

export function createAccountRecord(name?: string): {
  registry: AccountsRegistry;
  accountId: string;
} {
  const registry = ensureAccountsRegistry();
  const id = newAccountId();
  const t = nowIso();
  registry.accounts.push({
    id,
    name: name?.trim()?.slice(0, 48) || "Neuer Account",
    createdAt: t,
    updatedAt: t,
  });
  registry.activeId = id;
  writeRegistry(registry);
  saveFlowForAccount(id, emptyPersistedFlow());
  return { registry, accountId: id };
}

export function renameAccountRecord(
  accountId: string,
  name: string
): AccountsRegistry {
  const registry = ensureAccountsRegistry();
  const trimmed = name.trim().slice(0, 48);
  if (!trimmed) return registry;
  registry.accounts = registry.accounts.map((a) =>
    a.id === accountId ? { ...a, name: trimmed, updatedAt: nowIso() } : a
  );
  writeRegistry(registry);
  return registry;
}

export function deleteAccountRecord(accountId: string): AccountsRegistry | null {
  const registry = ensureAccountsRegistry();
  if (registry.accounts.length <= 1) return null;
  registry.accounts = registry.accounts.filter((a) => a.id !== accountId);
  try {
    localStorage.removeItem(flowStorageKey(accountId));
  } catch {
    /* ignorieren */
  }
  if (registry.activeId === accountId) {
    registry.activeId = registry.accounts[0]!.id;
  }
  writeRegistry(registry);
  return registry;
}

export function removeFlowForAccount(accountId: string): void {
  try {
    localStorage.removeItem(flowStorageKey(accountId));
  } catch {
    /* ignorieren */
  }
  saveFlowForAccount(accountId, emptyPersistedFlow());
}
