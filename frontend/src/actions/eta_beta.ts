'use server';

const API_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// ─── Generic helpers ──────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed [${res.status}]: ${text}`);
  }
  return res.json();
}

async function postQuery<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}${path}?${qs}`, { method: 'POST' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed [${res.status}]: ${text}`);
  }
  return res.json();
}

// ─── Input Parameters (Eta/Beta) ─────────────────────────────────────────────

export async function saveOrUpdateEtaBeta(payload: {
  component_id: string;
  eta: number;
  beta: number;
  priority: number;
}) {
  return postQuery('/api/reliability/eta-beta/save-or-update', {
    component_id: payload.component_id,
    eta: String(payload.eta),
    beta: String(payload.beta),
    priority: String(payload.priority),
  });
}

// ─── Actual Data ──────────────────────────────────────────────────────────────

export async function createActualData(record: {
  component_id: string;
  interval_start_date: string; // "YYYY-MM-DD"
  interval_end_date: string;
  f_s: 'Failure' | 'Suspension';
}) {
  return post('/api/reliability/actual-data', record);
}

export async function createActualDataBulk(records: {
  component_id: string;
  interval_start_date: string;
  interval_end_date: string;
  f_s: 'Failure' | 'Suspension';
}[]) {
  return post('/api/reliability/actual-data/bulk', records);
}

// ─── Interval Data ────────────────────────────────────────────────────────────

export async function createIntervalData(record: {
  component_id: string;
  installation_start_date: string;
  installation_end_date: string;
  removal_start_date: string;
  removal_end_date: string;
  f_s: 'Failure' | 'Suspension';
}) {
  return post('/api/reliability/interval-data', record);
}

export async function createIntervalDataBulk(records: {
  component_id: string;
  installation_start_date: string;
  installation_end_date: string;
  removal_start_date: string;
  removal_end_date: string;
  f_s: 'Failure' | 'Suspension';
}[]) {
  return post('/api/reliability/interval-data/bulk', records);
}

// ─── OEM Data ─────────────────────────────────────────────────────────────────

export async function createOEMData(record: {
  component_id: string;
  life_estimate1_name: string;
  life_estimate1_val: number;
  life_estimate2_name: string;
  life_estimate2_val: number;
}) {
  return post('/api/reliability/oem-data', record);
}

// ─── OEM Expert Data ──────────────────────────────────────────────────────────

export async function createOEMExpertData(record: {
  component_id: string;
  most_likely_life: number;
  max_life: number;
  min_life: number;
  num_component_wo_failure: number;
  time_wo_failure: number;
}) {
  return post('/api/reliability/oem-expert-data', record);
}

// ─── Expert Judgement ─────────────────────────────────────────────────────────

export async function createExpertJudgement(record: {
  component_id: string;
  most_likely_life: number;
  max_life: number;
  min_life: number;
  num_component_wo_failure: number;
  time_wo_failure: number;
}) {
  return post('/api/reliability/expert-judgement', record);
}

// ─── NPRD Data ────────────────────────────────────────────────────────────────

export async function createNPRDData(record: {
  component_id: string;
  failure_rate: number;
  beta: number;
}) {
  return post('/api/reliability/nprd-data', record);
}

// ─── Probability Failure ──────────────────────────────────────────────────────

export async function createProbabilityFailureBulk(records: {
  component_id: string;
  p_time: number;
  failure_p: number;
}[]) {
  return post('/api/reliability/probability-failure/bulk', records);
}