import type { ValueTransformer } from 'typeorm';

/** MySQL DECIMAL komt terug als string; API geeft numbers. */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null) =>
    value == null || value === '' ? null : Number(value),
};
