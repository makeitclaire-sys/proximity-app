export type Coords = { lat: number; lng: number }

// expo-location removed pending Android 12 compatibility investigation.
// getCurrentCoarseLocation returns null — discoverable rooms will fall back
// to code-only mode (no nearby section shown in JoinRoom).
export async function getCurrentCoarseLocation(): Promise<Coords | null> {
  return null
}

export function haversineMeters(a: Coords, b: Coords): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}
