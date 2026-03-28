import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { InstanceData } from "./types.js";
import { aggregateInstances } from "./aggregate.js";
import { renderSvg } from "./render.js";

const DATA_DIR = join(process.cwd(), "data");
const OUTPUT_FILE = join(process.cwd(), "stats.svg");

function loadInstances(): InstanceData[] {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const raw = readFileSync(join(DATA_DIR, f), "utf-8");
    return JSON.parse(raw) as InstanceData;
  });
}

const instances = loadInstances();
if (instances.length === 0) {
  console.error("No data files found in data/");
  process.exit(1);
}

const stats = aggregateInstances(instances);
const today = new Date().toISOString().slice(0, 10);
const svg = renderSvg(stats, today);

writeFileSync(OUTPUT_FILE, svg, "utf-8");
console.log(
  `Generated stats.svg (${instances.length} instance(s), ${stats.totalTokens} total tokens)`
);
