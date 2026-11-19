import { SelectQueryBuilder } from 'kysely';
import { Paginated } from 'src/types';
import { PaginationQuery } from './pagination.schema';

/** Runs the page query and a count over the same filters in parallel. */
export async function paginate<DB, TB extends keyof DB, O>(
  qb: SelectQueryBuilder<DB, TB, O>,
  { page, pageSize }: PaginationQuery,
): Promise<Paginated<O>> {
  const [items, countRow] = await Promise.all([
    qb
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute(),
    qb
      .clearSelect()
      .clearOrderBy()
      .select((eb) => eb.fn.countAll<string>().as('total'))
      .executeTakeFirstOrThrow(),
  ]);
  const total = Number((countRow as { total: string | number }).total);
  return { items, total, page, pageSize };
}
