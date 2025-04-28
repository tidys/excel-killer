import { Type } from "./rule";
const map = {};
map[Type.String] = "string";
map[Type.Number] = "number";

export function genDtsString(prefix: string, sheet: string, vars: Array<{ key: string; type: Type; desc: string }>) {
  prefix = prefix.replace(/\./g, "").replace(/\-/g, "");
  sheet = sheet.replace(/\-/g, "");
  const lines: string[] = [];
  lines.push(`export interface ${prefix.trim()}${sheet} {`);
  for (let i = 0; i < vars.length; i++) {
    const { desc, key, type } = vars[i];
    lines.push(`  /** ${desc}*/`);
    lines.push(`  ${key}: ${map[type] || "any"};`);
  }
  lines.push(`}`);
  return lines.join("\n");
}
