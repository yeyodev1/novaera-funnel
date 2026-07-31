/**
 * Helper para manejar Meta Pixel de forma segura y consistente.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

const DEFAULT_PIXEL_ID = '1239535288243292'

export function getMetaPixelId(): string {
  const envId = import.meta.env.VITE_META_PIXEL_ID
  if (
    envId &&
    typeof envId === 'string' &&
    envId.trim() !== '' &&
    envId !== '%VITE_META_PIXEL_ID%'
  ) {
    return envId.trim()
  }
  return DEFAULT_PIXEL_ID
}

let isInitialized = false

/**
 * Inicializa Meta Pixel con el Pixel ID desde .env o el id por defecto.
 */
export function initPixel(): void {
  if (isInitialized) return

  const pixelId = getMetaPixelId()
  if (!pixelId) return

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('init', pixelId)
      window.fbq('track', 'PageView')
      isInitialized = true
    } catch (err) {
      console.warn('[Meta Pixel] Error al inicializar:', err)
    }
  }
}

/**
 * Rastrea vistas de páginas dinámicas en SPA (Vue Router).
 */
export function trackPageView(): void {
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'PageView')
    } catch {
      // silencioso
    }
  }
}
