/**
 * Metadata DSL — the equivalent of Odoo's ir.model / ir.model.fields / ir.ui.view.
 * Nothing in the engine knows about any particular school: every model, field,
 * workflow stage, button and view is declared here as data and interpreted at runtime.
 */

export type FieldType =
  | 'char' | 'text' | 'html' | 'integer' | 'float' | 'monetary' | 'boolean'
  | 'date' | 'datetime' | 'selection' | 'many2one' | 'one2many' | 'many2many'
  | 'image' | 'priority';

export interface FieldDef {
  name: string;
  type: FieldType;
  string: string;
  required?: boolean;
  readonly?: boolean;
  relation?: string;
  inverse?: string;
  selection?: [string, string][];
  default?: string; // literal, or tokens: now | today | seq:PREFIX | true | false
}

export interface ButtonDef {
  name: string;
  string: string;
  primary: boolean;
  states: string[] | '*';
  /** target state for simple transitions; undefined => server method `name` */
  to?: string;
}

export interface SmartDef {
  string: string;
  model: string;
  /** field on target model pointing back to this record, or `=field` to open a linked record, or `#m2m` to count an m2m on self */
  field: string;
  sum?: string;
}

export interface FormLayout {
  title: string;
  avatar?: string;
  groups: string[];
  tabs: { title: string; fields: string[] }[];
}

export type ViewType = 'kanban' | 'list' | 'form' | 'calendar' | 'pivot' | 'graph';

export interface ModelDef {
  name: string;
  string: string;
  recName: string;
  fields: Record<string, FieldDef>;
  stageField?: string;
  buttons: ButtonDef[];
  smart: SmartDef[];
  views: ViewType[];
  list: string[];
  kanban: { title: string; sub: string[]; image?: string; groupBy?: string };
  form: FormLayout;
  calendar?: { start: string; stop?: string };
  search: { panel?: string; groupBy: string[] };
  ribbon?: { field: string; value: string; label: string };
  company: boolean;
  portal?: { studentField?: string; partnerField?: string };
}

const TYPE_ALIAS: Record<string, FieldType> = {
  char: 'char', text: 'text', html: 'html', int: 'integer', integer: 'integer',
  float: 'float', money: 'monetary', monetary: 'monetary',
  bool: 'boolean', boolean: 'boolean', date: 'date', datetime: 'datetime',
  sel: 'selection', selection: 'selection', m2o: 'many2one', many2one: 'many2one',
  o2m: 'one2many', one2many: 'one2many', m2m: 'many2many', many2many: 'many2many',
  image: 'image', priority: 'priority', binary: 'text',
};

export function humanize(name: string): string {
  const base = name.replace(/_ids?$/, '').replace(/_/g, ' ').trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const FIELD_RE = /^(\w+):(\w+)(?:\(((?:[^()]|\([^)]*\))*)\))?([!~]*)(?::([^=]+?))?(?:=(.*))?$/;

/** Parse `name:type(args)!~:Label=default; ...` */
export function parseFields(src: string): Record<string, FieldDef> {
  const out: Record<string, FieldDef> = {};
  for (const raw of src.split(/;|\n/)) {
    const part = raw.trim();
    if (!part) continue;
    const m = FIELD_RE.exec(part);
    if (!m) throw new Error(`Bad field spec: "${part}"`);
    const [, name, alias, args, flags, label, def] = m;
    const type = TYPE_ALIAS[alias];
    if (!type) throw new Error(`Unknown type "${alias}" in "${part}"`);
    const f: FieldDef = { name, type, string: (label ?? humanize(name)).trim() };
    if (flags.includes('!')) f.required = true;
    if (flags.includes('~')) f.readonly = true;
    if (def !== undefined) f.default = def.trim();
    if (type === 'selection') {
      f.selection = (args ?? '').split('|').filter(Boolean).map((p) => {
        const [k, v] = p.split('=');
        return [k.trim(), (v ?? humanize(k)).trim()] as [string, string];
      });
    } else if (type === 'many2one' || type === 'many2many') {
      f.relation = args?.trim();
    } else if (type === 'one2many') {
      const [rel, inv] = (args ?? '').split(',');
      f.relation = rel.trim();
      f.inverse = inv?.trim();
    }
    out[name] = f;
  }
  return out;
}

/** Buttons: `name:!Label:stateA,stateB>target` (transition) or `name:Label:states@` (server method). */
export function parseButtons(src: string): ButtonDef[] {
  return src.split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [name, label, rule = '*'] = s.split(':');
    const primary = label.startsWith('!');
    const isMethod = rule.endsWith('@');
    const [statesPart, to] = (isMethod ? rule.slice(0, -1) : rule).split('>');
    const states = !statesPart || statesPart === '*' ? '*' : statesPart.split(',').map((x) => x.trim());
    return { name, string: primary ? label.slice(1) : label, primary, states, to: isMethod ? undefined : to };
  });
}

/** Smart buttons: `Label:model:field[+sumField]` */
export function parseSmart(src: string): SmartDef[] {
  return src.split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [string, model, fieldSpec] = s.split(':');
    const [field, sum] = fieldSpec.split('+');
    return { string, model, field, sum };
  });
}

export interface ModelSpec {
  f: string;
  rec?: string;
  buttons?: string;
  smart?: string;
  views?: string;
  list?: string;
  kanban?: { title?: string; sub?: string; image?: string; groupBy?: string };
  tabs?: string; // "Tab A:f1,f2|Tab B:f3"
  cal?: string; // "start,stop"
  panel?: string;
  groupBy?: string;
  ribbon?: string; // "state=done:DONE"
  nocompany?: boolean;
  portal?: { studentField?: string; partnerField?: string };
}

const SCALAR_SKIP: FieldType[] = ['one2many', 'many2many', 'html', 'text', 'image'];

export function defineModel(name: string, string: string, spec: ModelSpec): ModelDef {
  const fields = parseFields(spec.f);
  if (!spec.nocompany && !fields.company_id) {
    fields.company_id = { name: 'company_id', type: 'many2one', relation: 'res.company', string: 'Campus / Company', default: 'company' };
  }
  const recName = spec.rec ?? (fields.name ? 'name' : Object.keys(fields)[0]);
  const stageField = fields.state?.type === 'selection' ? 'state'
    : fields.stage?.type === 'selection' ? 'stage'
    : fields.stage_id?.type === 'many2one' ? 'stage_id' : undefined;

  const tabs: { title: string; fields: string[] }[] = [];
  const inTab = new Set<string>();
  if (spec.tabs) {
    for (const t of spec.tabs.split('|')) {
      const [title, list] = t.split(':');
      const fs = list.split(',').map((x) => x.trim()).filter((x) => fields[x]);
      fs.forEach((x) => inTab.add(x));
      tabs.push({ title: title.trim(), fields: fs });
    }
  }
  for (const f of Object.values(fields)) {
    if ((f.type === 'one2many' || f.type === 'html') && !inTab.has(f.name)) {
      tabs.push({ title: f.string, fields: [f.name] });
      inTab.add(f.name);
    }
  }
  const avatar = Object.values(fields).find((f) => f.type === 'image')?.name;
  const groups = Object.keys(fields).filter(
    (k) => !inTab.has(k) && k !== recName && k !== stageField && k !== avatar,
  );

  const list = spec.list
    ? spec.list.split(',').map((s) => s.trim())
    : Object.values(fields)
        .filter((f) => !SCALAR_SKIP.includes(f.type) && f.name !== 'company_id' && f.name !== stageField)
        .slice(0, 6)
        .map((f) => f.name)
        .concat(stageField ? [stageField] : [], fields.company_id ? ['company_id'] : []);

  const subDefault = Object.values(fields)
    .filter((f) => (f.type === 'many2one' || f.type === 'char' || f.type === 'date') && f.name !== recName && f.name !== 'company_id' && f.name !== stageField)
    .slice(0, 2)
    .map((f) => f.name);

  const views = (spec.views ?? (stageField ? 'kanban,list,form,pivot,graph' : 'list,form,pivot')).split(',').map((v) => v.trim()) as ViewType[];
  if (!views.includes('form')) views.push('form');
  let calendar: ModelDef['calendar'];
  if (spec.cal) {
    const [start, stop] = spec.cal.split(',');
    calendar = { start, stop };
    if (!views.includes('calendar')) views.splice(views.length - 1, 0, 'calendar');
  }
  let ribbon: ModelDef['ribbon'];
  if (spec.ribbon) {
    const firstRule = spec.ribbon.split(';')[0].trim();
    const [cond, label] = firstRule.split(':');
    const [field, value] = cond.split('=');
    ribbon = { field: field.trim(), value: value.trim(), label: label.trim() };
  }
  const groupBy = spec.groupBy
    ? spec.groupBy.split(',').map((s) => s.trim())
    : Object.values(fields).filter((f) => f.type === 'many2one' || f.type === 'selection').slice(0, 5).map((f) => f.name);

  return {
    name, string, recName, fields, stageField,
    buttons: spec.buttons ? parseButtons(spec.buttons) : [],
    smart: spec.smart ? parseSmart(spec.smart) : [],
    views, list,
    kanban: {
      title: spec.kanban?.title ?? recName,
      sub: spec.kanban?.sub ? spec.kanban.sub.split(',') : subDefault,
      image: spec.kanban?.image ?? avatar,
      groupBy: spec.kanban?.groupBy === 'none' ? undefined : (spec.kanban?.groupBy ?? stageField),
    },
    form: { title: recName, avatar, groups, tabs },
    calendar,
    search: { panel: spec.panel, groupBy },
    ribbon,
    company: !spec.nocompany,
    portal: spec.portal,
  };
}
