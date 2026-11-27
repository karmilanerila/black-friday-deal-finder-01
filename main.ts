// DealHound entrypoint: hand the site in.
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-frontend.ts. Node 22, standard library only.

import { cpSync, mkdirSync, readdirSync, writeFileSync, chmodSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });

cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), {
  recursive: true,
});

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
  app_path_max_bytes: 1000,
});

const dossierPath = join(outDir, "dossier.json");
writeFileSync(dossierPath, dossier);
chmodSync(dossierPath, 0o644);

const appFiles = readdirSync(join(outDir, "app"));
const shotFiles = readdirSync(join(outDir, "screenshots"));
console.log(
  `DealHound entry written to ${outDir} (${appFiles.length} app files, ${shotFiles.length} screenshots, dossier ${dossier.length} bytes)`,
);
