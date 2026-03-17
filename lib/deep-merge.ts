export function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base }
  for (const key in override) {
    if (
      override[key] !== null &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key]) &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key] as object, override[key] as object) as T[typeof key]
    } else if (override[key] !== undefined) {
      result[key] = override[key] as T[typeof key]
    }
  }
  return result
}
