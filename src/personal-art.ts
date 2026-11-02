/**
 * Private local interchange for Domistika XR Export PNG (also JPEG/WebP).
 * One compressed, bounded painting stored in this origin's IndexedDB.
 * No fetch, remote URLs, SVG, scripts, sync, credentials or external storage.
 */
export const PERSONAL_ART_MAX_INPUT_BYTES = 8 * 1024 * 1024
export const PERSONAL_ART_MAX_STORED_BYTES = 5 * 1024 * 1024
export const PERSONAL_ART_MAX_PIXELS = 32 * 1024 * 1024
export const PERSONAL_ART_WIDTH = 1024
export const PERSONAL_ART_HEIGHT = 768
export const PERSONAL_ART_MODE_KEY = 'phios-xr-hearth-art-mode-v1'
const DB_NAME = 'phios-xr-local-art-v1'
const STORE_NAME = 'gallery'
const RECORD_KEY = 'personal-painting'

export type PersonalArtMode = 'curated' | 'personal'
export type PersonalArtRecord = { name: string; image: Blob }
export type PreparedPersonalArt = PersonalArtRecord & { canvas: HTMLCanvasElement }

export function sanitizePersonalArtName(value: string): string {
  const cleaned = value.replace(/[\x00-\x1f\x7f<>]/g, '').trim().slice(0, 64)
  return cleaned || 'My artwork'
}
export function readPersonalArtMode(storage: Pick<Storage, 'getItem'> | null): PersonalArtMode {
  if (!storage) return 'curated'
  try { return storage.getItem(PERSONAL_ART_MODE_KEY) === 'personal' ? 'personal' : 'curated' }
  catch { return 'curated' }
}
export function writePersonalArtMode(storage: Pick<Storage, 'setItem'> | null, mode: PersonalArtMode): void {
  try { storage?.setItem(PERSONAL_ART_MODE_KEY, mode) } catch { /* private mode */ }
}

/** Check a file's actual magic bytes, never trust a renamed .svg or misleading MIME. */
export function detectedRasterType(header: Uint8Array): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (header.length >= 8 &&
    [137,80,78,71,13,10,26,10].every((n, i) => header[i] === n)) return 'image/png'
  if (header.length >= 3 && header[0] === 255 && header[1] === 216 && header[2] === 255) return 'image/jpeg'
  if (header.length >= 12 && String.fromCharCode(...header.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...header.slice(8, 12)) === 'WEBP') return 'image/webp'
  return null
}
export function validatePersonalArtSize(bytes: number): void {
  if (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > PERSONAL_ART_MAX_INPUT_BYTES) {
    throw new Error('Choose a PNG, JPEG, or WebP image up to 8 MB.')
  }
}

/** Composes transparent PNGs onto a matte and caps GPU use at 1024×768. */
export async function preparePersonalArt(source: Blob, name = 'My artwork'): Promise<PreparedPersonalArt> {
  validatePersonalArtSize(source.size)
  const header = new Uint8Array(await source.slice(0, 16).arrayBuffer())
  const type = detectedRasterType(header)
  if (!type || (source.type && source.type !== type)) {
    throw new Error('Unsupported image. Use Domistika Export PNG, JPEG, or WebP.')
  }
  if (typeof createImageBitmap !== 'function') {
    throw new Error('This browser cannot decode the artwork. Try a current Quest or desktop browser.')
  }
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(source) }
  catch { throw new Error('Unable to decode this image. Export a fresh PNG from Domistika.') }
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > PERSONAL_ART_MAX_PIXELS) {
      throw new Error('This painting is too large to safely open (32 megapixels maximum).')
    }
    const canvas = document.createElement('canvas')
    canvas.width = PERSONAL_ART_WIDTH
    canvas.height = PERSONAL_ART_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas rendering is unavailable in this browser.')
    ctx.fillStyle = '#f7f1e6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const padding = 18
    const scale = Math.min((canvas.width - padding * 2) / bitmap.width, (canvas.height - padding * 2) / bitmap.height)
    const width = bitmap.width * scale, height = bitmap.height * scale
    ctx.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
    const image = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image conversion failed.')), 'image/png')
    })
    if (image.size > PERSONAL_ART_MAX_STORED_BYTES) {
      throw new Error('The prepared painting exceeds 5 MB. Use a smaller PNG export.')
    }
    return { name: sanitizePersonalArtName(name), image, canvas }
  } finally {
    bitmap.close()
  }
}

async function openArtDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') throw new Error('Browser gallery storage unavailable')
  return await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Local gallery storage unavailable'))
    request.onblocked = () => reject(new Error('Gallery storage is busy in another tab'))
  })
}
export async function loadPersonalArt(): Promise<PersonalArtRecord | null> {
  const db = await openArtDatabase()
  try {
    return await new Promise<PersonalArtRecord | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(RECORD_KEY)
      request.onsuccess = () => {
        const item: unknown = request.result
        if (!item || typeof item !== 'object' || !('name' in item) || !('image' in item)) return resolve(null)
        const { name, image } = item as { name: unknown; image: unknown }
        resolve(typeof name === 'string' && image instanceof Blob &&
          image.type === 'image/png' && image.size > 0 && image.size <= PERSONAL_ART_MAX_STORED_BYTES
          ? { name: sanitizePersonalArtName(name), image } : null)
      }
      request.onerror = () => reject(request.error ?? new Error('Unable to read saved art'))
    })
  } finally { db.close() }
}
export async function savePersonalArt(item: PersonalArtRecord): Promise<void> {
  if (item.image.type !== 'image/png' || item.image.size > PERSONAL_ART_MAX_STORED_BYTES) {
    throw new Error('Only a prepared, bounded PNG can be saved.')
  }
  const db = await openArtDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(
        { image: item.image, name: sanitizePersonalArtName(item.name) }, RECORD_KEY,
      )
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('Gallery save failed'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Gallery save was blocked'))
    })
  } finally { db.close() }
}
export async function removePersonalArt(): Promise<void> {
  const db = await openArtDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).delete(RECORD_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('Gallery deletion failed'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Gallery deletion was blocked'))
    })
  } finally { db.close() }
}
