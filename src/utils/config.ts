import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { SUPPORTED_LOCALES } from "../shared/types";

const CONFIG_DIR = path.resolve(process.cwd(), ".kiro");
const CONFIG_FILENAME = "spec-pilot.json";
const CONFIG_PATH = path.join(CONFIG_DIR, CONFIG_FILENAME);

const ConfigSchema = z
  .object({
    locale: z.enum(SUPPORTED_LOCALES).optional(),
  })
  .passthrough();

export type SpecPilotConfig = z.infer<typeof ConfigSchema>;

export const getConfigPath = () => CONFIG_PATH;

export const readConfig = (): SpecPilotConfig => {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return {};
    }

    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    if (!raw.trim()) {
      return {};
    }

    const parsed = JSON.parse(raw);
    const result = ConfigSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    console.warn("spec-pilot config parse error", result.error.format());
    return {};
  } catch (error) {
    console.warn("spec-pilot config read error", error);
    return {};
  }
};

export const writeConfig = (updates: Partial<SpecPilotConfig>) => {
  try {
    const current = readConfig();
    const next = { ...current, ...updates } as SpecPilotConfig;

    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");

    return next;
  } catch (error) {
    console.warn("spec-pilot config write error", error);
    return undefined;
  }
};
