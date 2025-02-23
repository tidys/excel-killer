import { Type } from "./rule";
const map = {};
map[Type.String] = "String";
map[Type.Number] = "Number";

export function genDtsString(sheet: string, vars: Array<{ key: string; type: Type; desc: string }>) {
  const lines: string[] = [];
  lines.push(`export interface ${sheet} {`);
  for (let i = 0; i < vars.length; i++) {
    const { desc, key, type } = vars[i];
    lines.push(`  /** ${desc}*/`);
    lines.push(`  ${key}: ${map[type] || "any"};`);
  }
  lines.push(`}`);
  return lines.join("\n");
}
