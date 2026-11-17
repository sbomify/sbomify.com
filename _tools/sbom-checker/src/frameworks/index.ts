/** Frameworks the checker runs, in the order they are shown. */
import type { Framework } from "../types";
import { cisa2026 } from "./cisa-2026";
import { bsiTr03183 } from "./bsi-tr03183";
import { ntia2021 } from "./ntia-2021";
import { cisa2025 } from "./cisa-2025";

export const FRAMEWORKS: Framework[] = [cisa2026, bsiTr03183, ntia2021, cisa2025];
