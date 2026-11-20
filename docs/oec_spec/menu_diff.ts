import { readFileSync, writeFileSync } from 'node:fs';
import { APPS } from '../../shared/meta/menus';

const root = 'c:/Users/Yankees/Downloads/school-erp';
const lines = readFileSync(`${root}/docs/oec_spec/menu_tree.md`, 'utf8').split(/\r?\n/).filter(Boolean);
type Leaf = { path: string; label: string; model: string; modes: string; tag: string };
const live: { app: string; model: string; modes: string; leaves: Leaf[] }[] = [];
const stack: string[] = [];
for (const l of lines) {
  const depth = (l.match(/^ */)![0].length) / 2;
  const m = l.trim().match(/^- (.*?)(?: => \[(\S+)\] (\S*) \{([^}]*)\} ?(.*))?$/)!;
  const label = m[1].trim();
  stack.length = depth; stack[depth] = label;
  if (depth === 0) { live.push({ app: label, model: m[3] || '', modes: m[4] || '', leaves: [] }); continue; }
  if (m[2]) live[live.length - 1].leaves.push({ path: stack.slice(1).join(' / '), label, model: m[3], modes: m[4], tag: (m[5] || '').trim() });
}
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
let md = '';
let summary = '| # | Live app | Local app | Live leaf menus | Missing locally | Model mismatches |\n|---|---|---|---|---|---|\n';
live.forEach((a, i) => {
  const loc = APPS.find(x => norm(x.label) === norm(a.app)) || APPS.find(x => x.defaultModel && x.defaultModel === a.model);
  const missing: string[] = []; const mism: string[] = [];
  for (const lf of a.leaves) {
    const hit = loc?.menus.find(mm => norm(mm.label) === norm(lf.label) || (lf.model && lf.model !== 'False' && mm.model === lf.model && norm(mm.label).includes(norm(lf.label).slice(0, 5))));
    if (!hit) missing.push(`${lf.path} → \`${lf.model || lf.tag}\` {${lf.modes}}`);
    else if (lf.model && lf.model !== 'False' && hit.model && hit.model !== lf.model) mism.push(`${lf.label}: live \`${lf.model}\` vs local \`${hit.model}\``);
  }
  summary += `| ${i + 1} | ${a.app} | ${loc ? loc.label : '**MISSING**'} | ${a.leaves.length} | ${missing.length} | ${mism.length} |\n`;
  md += `\n### ${i + 1}. ${a.app} ${loc ? '' : '— app missing locally'}\n- Root action: \`${a.model}\` {${a.modes}}\n`;
  if (missing.length) md += `- Missing menus:\n${missing.map(x => `  - [ ] ${x}`).join('\n')}\n`;
  if (mism.length) md += `- Model mismatches:\n${mism.map(x => `  - [ ] ${x}`).join('\n')}\n`;
  if (!missing.length && !mism.length) md += `- Menu structure: matches (views/forms still to verify)\n`;
});
const extra = APPS.filter(x => !live.some(a => norm(a.app) === norm(x.label))).map(x => x.label);
writeFileSync(`${root}/docs/oec_spec/menu_diff.md`, summary + `\nLocal-only apps: ${extra.join(', ') || 'none'}\n` + md);
console.log(summary);
console.log('Local-only:', extra.join(', '));
