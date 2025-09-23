/**
 * Spec-pilot共通定数
 */
export const SPEC_PILOT_CONSTANTS = {
  BASE_DIR: ".kiro/specs",
  CONFIG_FILE: ".kiro/spec-pilot.json",
  REQUIREMENTS_FILE: "requirements.md",
  SPEC_CONFIG_FILE: "config.json",
} as const;

export type SpecPilotConstants = typeof SPEC_PILOT_CONSTANTS;
