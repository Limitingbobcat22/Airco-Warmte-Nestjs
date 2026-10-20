import { StreamableFile } from '@nestjs/common';
import { Workbook } from 'exceljs';

export const EXCEL_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export type ExcelColumn = {
  header: string;
  key: string;
  width?: number;
  text?: boolean;
};

const exportStamp = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const dateTimeLabel = new Intl.DateTimeFormat('nl-NL', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Amsterdam',
});

const eurWhole = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const eurExact = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurPrice = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export function exportFilename(subject: string, now = new Date()): string {
  const safe = subject
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '');
  const parts = exportStamp.formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00';
  return `aircoenwarmte-${safe}-${pick('year')}-${pick('month')}-${pick('day')}-${pick('hour')}-${pick('minute')}.xlsx`;
}

export function selectExportColumns<T extends { key: string }>(
  columns: T[],
  requested?: string[],
): T[] {
  if (!requested?.length) return columns;
  const wanted = new Set(requested);
  const selected = columns.filter((column) => wanted.has(column.key));
  return selected.length > 0 ? selected : columns;
}

export function formatExportDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) return '–';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '–';
  return dateTimeLabel.format(date);
}

export function formatYesNo(
  value: boolean | number | null | undefined,
): string {
  if (value == null) return '–';
  return value ? 'Ja' : 'Nee';
}

export function formatReadStatus(
  value: boolean | number | null | undefined,
): string {
  return value ? 'Gelezen' : 'Nieuw';
}

export function asNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

export function formatMeasure(
  value: unknown,
  digits: number | null,
  suffix: string,
): string {
  const number = asNumber(value);
  if (number == null) return '–';
  const amount = digits == null ? String(number) : number.toFixed(digits);
  return `${amount}${suffix}`;
}

export function formatEurWhole(value: unknown): string {
  const number = asNumber(value);
  return number == null ? '–' : eurWhole.format(number);
}

export function formatEurExact(value: unknown, suffix = ''): string {
  const number = asNumber(value);
  return number == null ? '–' : `${eurExact.format(number)}${suffix}`;
}

export function formatEurPrice(value: unknown): string {
  const number = asNumber(value);
  return number == null ? '–' : eurPrice.format(number);
}

export function textOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '–';
}

export async function workbookBuffer(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Record<string, string | number | null | undefined>[],
): Promise<Buffer> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width ?? 18,
  }));

  for (const row of rows) {
    sheet.addRow(row);
  }

  for (const column of columns) {
    if (column.text) sheet.getColumn(column.key).numFmt = '@';
  }

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  if (columns.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
  }

  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

export function excelDownload(buffer: Buffer, subject: string): StreamableFile {
  return new StreamableFile(buffer, {
    type: EXCEL_MIME,
    disposition: `attachment; filename="${exportFilename(subject)}"`,
  });
}
