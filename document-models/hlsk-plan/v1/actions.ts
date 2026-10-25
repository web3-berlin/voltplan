/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  hlskPlanCoreActions,
  hlskPlanDuctsActions,
  hlskPlanFixturesActions,
  hlskPlanPipesActions,
  hlskPlanRisersActions,
  hlskPlanRoomsActions,
} from "./gen/creators.js";

/** Actions for the HlskPlan document model */

export const actions = {
  ...baseActions,
  ...hlskPlanCoreActions,
  ...hlskPlanRoomsActions,
  ...hlskPlanFixturesActions,
  ...hlskPlanPipesActions,
  ...hlskPlanDuctsActions,
  ...hlskPlanRisersActions,
};
