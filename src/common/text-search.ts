import { Brackets, type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function likePattern(search?: string): string | null {
  const term = search?.trim();
  if (!term) return null;
  return `%${escapeLike(term)}%`;
}

export function compactLikePattern(search?: string): string | null {
  const term = search?.trim().replace(/\s+/g, '');
  if (!term) return null;
  return `%${escapeLike(term)}%`;
}

function likeSql(expression: string, param: string): string {
  return `${expression} LIKE :${param} ESCAPE '\\\\'`;
}

export function applyTextSearch<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  search: string | undefined,
  expressions: string[],
  compactExpressions: string[] = [],
): void {
  const pattern = likePattern(search);
  if (!pattern) return;

  const compact = compactLikePattern(search);
  qb.andWhere(
    new Brackets((sub) => {
      expressions.forEach((expression, index) => {
        const clause = likeSql(expression, 'search');
        if (index === 0) sub.where(clause, { search: pattern });
        else sub.orWhere(clause);
      });

      if (!compact) return;
      for (const expression of compactExpressions) {
        sub.orWhere(likeSql(expression, 'compactSearch'), {
          compactSearch: compact,
        });
      }
    }),
  );
}
