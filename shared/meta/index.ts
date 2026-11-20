import type { ModelDef } from './dsl.js';
import { coreModels } from './models/core.js';
import { academicModels } from './models/academics.js';
import { assessmentModels } from './models/assessments.js';
import { campusModels } from './models/campus.js';
import { backofficeModels } from './models/backoffice.js';

export * from './dsl.js';
export * from './menus.js';
export * from './reports.js';
export * from './security.js';

export const ALL_MODELS: ModelDef[] = [
  ...coreModels,
  ...academicModels,
  ...assessmentModels,
  ...campusModels,
  ...backofficeModels,
];

export const MODEL_MAP: Record<string, ModelDef> = Object.fromEntries(
  ALL_MODELS.map((m) => [m.name, m]),
);
