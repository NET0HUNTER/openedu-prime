import { ALL_MODELS, APPS, PORTAL_CARDS, PUBLIC_ROUTES } from '../shared/meta/index.js';

export function buildOpenApiSpec(serverUrl = 'http://localhost:4100') {
  const schemas: Record<string, unknown> = {
    RpcRequest: {
      type: 'object',
      properties: {
        domain: { type: 'object', additionalProperties: true },
        vals: { type: 'object', additionalProperties: true },
        id: { type: 'integer' },
        search: { type: 'string' },
        groupBy: { type: 'string' },
        limit: { type: 'integer', default: 80 },
        offset: { type: 'integer', default: 0 },
      },
    },
    MpesaStkRequest: {
      type: 'object',
      required: ['phone', 'amount'],
      properties: {
        phone: { type: 'string', example: '+254722810400' },
        amount: { type: 'number', example: 305000 },
        move_id: { type: 'integer' },
        student_id: { type: 'integer' },
        accountRef: { type: 'string' },
      },
    },
  };

  for (const m of ALL_MODELS) {
    const props: Record<string, unknown> = { id: { type: 'integer' } };
    const req: string[] = [];
    for (const f of Object.values(m.fields)) {
      let schema: Record<string, unknown> = { type: 'string', title: f.string };
      if (f.type === 'integer' || f.type === 'many2one' || f.type === 'priority') schema = { type: 'integer', title: f.string };
      else if (f.type === 'float' || f.type === 'monetary') schema = { type: 'number', title: f.string };
      else if (f.type === 'boolean') schema = { type: 'boolean', title: f.string };
      else if (f.type === 'many2many') schema = { type: 'array', items: { type: 'integer' }, title: f.string };
      else if (f.type === 'one2many') schema = { type: 'array', items: { type: 'object' }, title: f.string };
      else if (f.type === 'selection' && f.selection) schema = { type: 'string', enum: f.selection.map(([k]) => k), title: f.string };
      props[f.name] = schema;
      if (f.required) req.push(f.name);
    }
    schemas[m.name] = { type: 'object', properties: props, ...(req.length ? { required: req } : {}) };
  }

  const paths: Record<string, unknown> = {
    '/api/v1/meta/session': { get: { tags: ['Metadata & Shell'], summary: 'Get active session, theme tokens, terminology, and campuses', responses: { '200': { description: 'OK' } } } },
    '/api/v1/meta/menus': { get: { tags: ['Metadata & Shell'], summary: `Get all ${APPS.length} ERP apps & role-filtered sub-menus`, responses: { '200': { description: 'OK' } } } },
    '/api/v1/meta/models': { get: { tags: ['Metadata & Shell'], summary: `Get all ${ALL_MODELS.length} model view & field definitions`, responses: { '200': { description: 'OK' } } } },
    '/api/v1/auth/demo-login': { post: { tags: ['Authentication'], summary: 'Authenticate as demo role (admin, faculty, backoffice, student, parent)', responses: { '200': { description: 'Authenticated' } } } },
    '/api/v1/auth/login': { post: { tags: ['Authentication'], summary: 'Standard email/password login', responses: { '200': { description: 'Authenticated' } } } },
    '/api/v1/dataset/call_kw/{model}/{method}': {
      post: {
        tags: ['Generic ORM RPC'],
        summary: 'Execute search_read, web_save, create, write, unlink, read_group, or workflow action method',
        parameters: [
          { name: 'model', in: 'path', required: true, schema: { type: 'string', enum: ALL_MODELS.map((m) => m.name) } },
          { name: 'method', in: 'path', required: true, schema: { type: 'string', example: 'search_read' } },
          { name: 'X-Company-Ids', in: 'header', required: false, schema: { type: 'string', example: '1,2,3,4,5,6' } },
        ],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RpcRequest' } } } },
        responses: { '200': { description: 'RPC Result' } },
      },
    },
    '/api/v1/portal/my': { get: { tags: ['Portals & Public Web'], summary: `Student/Parent /my portal KPIs, charts & ${PORTAL_CARDS.length} service cards`, responses: { '200': { description: 'OK' } } } },
    '/api/v1/kpi/executive': { get: { tags: ['Analytics & BI'], summary: 'Multi-campus OERB & OpenEduCat live KPI dashboard', responses: { '200': { description: 'OK' } } } },
    '/api/v1/timetable/generate': { post: { tags: ['Academics & Intervals'], summary: 'Batch generate timetable sessions honoring campus bell intervals', responses: { '200': { description: 'Generated' } } } },
    '/api/v1/attendance/kiosk-checkin': { post: { tags: ['Academics & Intervals'], summary: 'Student Kiosk PIN / Barcode / Face check-in', responses: { '200': { description: 'Checked in' } } } },
    '/api/v1/public/apply': { post: { tags: ['Portals & Public Web'], summary: 'Submit online admission application from public /courses-offered', responses: { '201': { description: 'Application Created' } } } },
    '/api/v1/integrations/mpesa/stk-push': {
      post: {
        tags: ['Integrations (M-Pesa, WhatsApp, EDI, AI)'],
        summary: 'Initiate M-Pesa Daraja 3.0 STK Push for school fees',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/MpesaStkRequest' } } } },
        responses: { '200': { description: 'STK Push processed' } },
      },
    },
    '/api/v1/integrations/mpesa/c2b-callback': { post: { tags: ['Integrations (M-Pesa, WhatsApp, EDI, AI)'], summary: 'Daraja C2B / STK callback webhook', responses: { '200': { description: 'Reconciled' } } } },
    '/api/v1/integrations/whatsapp/send': { post: { tags: ['Integrations (M-Pesa, WhatsApp, EDI, AI)'], summary: 'Send WhatsApp Cloud API or simulated parent message', responses: { '200': { description: 'Queued/Sent' } } } },
    '/api/v1/integrations/exam-boards/edi-export': { get: { tags: ['Integrations (M-Pesa, WhatsApp, EDI, AI)'], summary: 'Export CAIE / Pearson Edexcel candidate subject entries (EDI)', responses: { '200': { description: 'EDI Payload' } } } },
    '/api/v1/integrations/ai/generate': { post: { tags: ['Integrations (M-Pesa, WhatsApp, EDI, AI)'], summary: 'AI LMS Course / Quiz / Agent prompt generator', responses: { '200': { description: 'Generated' } } } },
    '/api/v1/cron/{id}/run': { post: { tags: ['Scheduled Intervals (ir.cron)'], summary: 'Trigger a scheduled cron interval immediately', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Executed' } } } },
    '/api/v1/admin/switch-seed': { post: { tags: ['Metadata & Shell'], summary: 'Switch active declarative seed pack (oshwal vs default)', responses: { '200': { description: 'Reseeded' } } } },
  };

  // Expose typed REST CRUD paths for every model across all 53 modules
  for (const m of ALL_MODELS) {
    const slug = m.name.replace(/\./g, '-');
    paths[`/api/v1/models/${slug}`] = {
      get: { tags: ['53-Module REST Resources'], summary: `List ${m.string} (${m.name})`, responses: { '200': { description: 'List' } } },
      post: { tags: ['53-Module REST Resources'], summary: `Create ${m.string} (${m.name})`, requestBody: { content: { 'application/json': { schema: { $ref: `#/components/schemas/${m.name}` } } } }, responses: { '201': { description: 'Created' } } },
    };
    paths[`/api/v1/models/${slug}/{id}`] = {
      get: { tags: ['53-Module REST Resources'], summary: `Get ${m.string} by ID`, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Record' } } },
      patch: { tags: ['53-Module REST Resources'], summary: `Update ${m.string}`, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['53-Module REST Resources'], summary: `Delete ${m.string}`, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Deleted' } } },
    };
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'OpenEduCat Multi-Campus School ERP API (Oshwal Academy Nairobi & Mombasa Ready)',
      version: '1.0.0',
      description: `Metadata-driven School ERP covering all ${APPS.length} modules, ${ALL_MODELS.length} models, ${PUBLIC_ROUTES.length} public website routes, ${PORTAL_CARDS.length} portal cards, scheduled ir.cron intervals, M-Pesa Daraja 3.0, WhatsApp Cloud API, and CAIE/Edexcel EDI.`,
    },
    servers: [{ url: serverUrl }],
    paths,
    components: { schemas },
  };
}
