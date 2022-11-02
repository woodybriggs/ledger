
export const omit = <K extends (keyof T), T extends { [key: string]: any }>(object: T, keys: (keyof T)[]): Omit<T, K> => {  
  const newEntries = Object
    .entries(object)
    .filter(([k, v]) => !keys.includes(k))
  
  return Object.fromEntries(newEntries) as Omit<T, K>
}