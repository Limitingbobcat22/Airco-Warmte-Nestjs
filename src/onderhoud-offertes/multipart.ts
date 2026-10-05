export function toBoolean(value: unknown): unknown {
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0' || value === '') {
    return false;
  }
  return value;
}

export function toIdList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => toIdList(item));
  }
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      return toIdList(JSON.parse(trimmed) as unknown);
    } catch {
      return [];
    }
  }
  return trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
