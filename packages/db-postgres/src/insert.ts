import type { TransactionPg } from '@payloadcms/drizzle/types'

import type { Insert } from './types.js'

export const insert: Insert = async function insert({
  db,
  onConflictDoUpdate,
  tableName,
  values,
}): Promise<Record<string, unknown>[]> {
  const table = this.tables[tableName]
  let result

  if (onConflictDoUpdate) {
    result = await (db as TransactionPg)
      .insert(table)
      .values(values)
      // @ts-expect-error drizzle-orm confusing libsql and pgsql types
      .onConflictDoUpdate(onConflictDoUpdate)
      .returning()
  } else {
    result = await (db as TransactionPg).insert(table).values(values).returning()
  }

  return result
}