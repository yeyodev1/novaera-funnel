/**
 * Captura fbclid, UTMs, _fbc y _fbp para atribución completa de Meta Ads.
 *
 * fbclid       → generado por Meta al hacer click en un anuncio
 * fbc          → cookie estándar Meta: fb.1.{ts}.{fbclid}
 * fbp          → cookie de browser ID de Meta (generada por el Pixel)
 * utm_source   → ej. "facebook", "meta"
 * utm_medium   → ej. "paid_ad", "paid"
 * utm_campaign → ej. "yeyo-tofu-lead"
 * utm_content  → ID o nombre del anuncio
 * utm_term     → ID del adset (opcional)
 * utm_id       → ID numérico de la campaña (opcional)
 */

const STORAGE_KEY = 'os_fb'

export interface FbParams {
  fbclid: string
  fbc: string
  fbp: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  utm_id: string
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : ''
}

function setCookie(name: string, value: string, days = 90): void {
  if (!value) return
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function buildFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`
}

/**
 * Captura fbclid + UTMs de la URL (o query object) y los persiste en sessionStorage, localStorage y cookies _fbc.
 */
export function captureFbParams(queryParams?: Record<string, string | undefined>): void {
  const searchParams = new URLSearchParams(window.location.search)

  const getParam = (key: string): string => {
    if (queryParams && queryParams[key]) return queryParams[key] as string
    return searchParams.get(key) ?? ''
  }

  const fbclid = getParam('fbclid')
  const existing = getStoredFbParams()

  // Si no hay un fbclid nuevo pero ya tenemos datos guardados, conservar y refrescar cookies
  if (!fbclid && existing.fbclid) {
    if (existing.fbc) setCookie('_fbc', existing.fbc)
    return
  }

  const fbcValue = fbclid ? buildFbc(fbclid) : getCookie('_fbc') || existing.fbc

  // Asegurar que la cookie _fbc exista en document.cookie para Meta Pixel
  if (fbcValue) {
    setCookie('_fbc', fbcValue)
  }

  const data: FbParams = {
    fbclid: fbclid || existing.fbclid,
    fbc: fbcValue,
    fbp: getCookie('_fbp') || existing.fbp,
    utm_source: getParam('utm_source') || existing.utm_source,
    utm_medium: getParam('utm_medium') || existing.utm_medium,
    utm_campaign: getParam('utm_campaign') || existing.utm_campaign,
    utm_content: getParam('utm_content') || existing.utm_content,
    utm_term: getParam('utm_term') || existing.utm_term,
    utm_id: getParam('utm_id') || existing.utm_id,
  }

  const jsonStr = JSON.stringify(data)
  try {
    sessionStorage.setItem(STORAGE_KEY, jsonStr)
    localStorage.setItem(STORAGE_KEY, jsonStr)
  } catch {
    /* ignorar */
  }
}

/**
 * Retorna todos los parámetros de atribución almacenados en esta sesión / localStorage.
 */
export function getStoredFbParams(): FbParams {
  try {
    const rawSession = sessionStorage.getItem(STORAGE_KEY)
    if (rawSession) return JSON.parse(rawSession) as FbParams

    const rawLocal = localStorage.getItem(STORAGE_KEY)
    if (rawLocal) return JSON.parse(rawLocal) as FbParams
  } catch {
    /* ignorar */
  }
  return {
    fbclid: '',
    fbc: '',
    fbp: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    utm_id: '',
  }
}
