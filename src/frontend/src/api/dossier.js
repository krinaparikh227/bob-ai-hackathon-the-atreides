/**
 * dossier.js — API calls for the Submission Readiness mode.
 *
 * All backend interactions for this mode live here.
 * When the backend team confirms the final API contract
 * (e.g. multipart file upload, JSON body with outline structure),
 * update only this file — components are unaffected.
 *
 * Current backend: GET /api/dossier/check → { status, completeness_score: 0, gaps: [] }
 * Expected future gap shape:
 *   { module, section_id, section_name, status: 'missing'|'invalid' }
 */

const API_BASE = '/api'  // Vite proxies /api → http://localhost:8000

/**
 * Check a dossier outline against ICH M4 CTD requirements.
 * @param {Object} params
 * @param {string} [params.outline] - Raw text or JSON outline content (future: send as body)
 * @returns {Promise<{ status: string, completeness_score: number, gaps: Array }>}
 */
export async function checkDossier({ outline = '' } = {}) {
  const res = await fetch(`${API_BASE}/dossier/check`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to check dossier (HTTP ${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Upload an eCTD XML, JSON, or text dossier outline file for live structural audit.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function uploadDossierFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/dossier/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to upload dossier (HTTP ${res.status}): ${text}`)
  }
  return res.json()
}

