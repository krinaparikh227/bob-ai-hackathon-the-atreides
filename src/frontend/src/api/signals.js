/**
 * signals.js — API calls for the Signal Detection mode.
 *
 * All backend interactions for this mode live here.
 * When the backend team confirms the final API contract
 * (e.g. POST with a drug name, query params, pagination),
 * update only this file — components are unaffected.
 *
 * Current backend: GET /api/signals → { status, signals: [] }
 * Expected future signal shape:
 *   { drug_name, event_term, prr_score, case_count, severity }
 */

const API_BASE = '/api'  // Vite proxies /api → http://localhost:8000

/**
 * Fetch adverse event safety signals from the backend.
 * @param {Object} params
 * @param {string} [params.drugName] - Optional drug name filter
 * @returns {Promise<{ status: string, signals: Array }>}
 */
export async function fetchSignals({ drugName = '' } = {}) {
  const url = new URL(`${API_BASE}/signals`, window.location.origin)
  if (drugName.trim()) {
    url.searchParams.set('drug', drugName.trim())
  }

  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to fetch signals (HTTP ${res.status}): ${text}`)
  }
  return res.json()
}
