import { nanoid } from 'nanoid'

export function createId(size = 8): string {
  return nanoid(size)
}
