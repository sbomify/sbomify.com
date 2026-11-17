/**
 * Web Worker: runs the analysis off the main thread so a large SBOM (an
 * SPDX 3 Yocto build can take seconds to validate) never freezes the page.
 */
import { analyse } from "./analyse";

export type WorkerRequest = { id: number; text: string; name: string };

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, text, name } = event.data;
  try {
    const result = await analyse(text, name);
    (self as unknown as Worker).postMessage({ id, result });
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, result: { ok: false, name, error: `The check crashed: ${err instanceof Error ? err.message : String(err)}`, errorKind: "crashed" } });
  }
};
