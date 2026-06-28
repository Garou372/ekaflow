const DEFAULT_PREFIX = "INV";

export interface GenerateInvoiceNumberOptions {
  prefix?: string;
  date?: Date;
  sequence?: number;
}

function padSequence(sequence: number): string {
  return sequence.toString().padStart(4, "0");
}

/**
 * Example:
 * INV-2026-0001
 */
export function generateInvoiceNumber(
  options: GenerateInvoiceNumberOptions = {},
): string {
  const { prefix = DEFAULT_PREFIX, date = new Date(), sequence = 1 } = options;

  const year = date.getFullYear();

  return `${prefix}-${year}-${padSequence(sequence)}`;
}

/**
 * Returns next invoice number from latest invoice.
 *
 * Example:
 * INV-2026-0009
 * =>
 * INV-2026-0010
 */
export function getNextInvoiceNumber(
  latestInvoiceNumber?: string,
  prefix = DEFAULT_PREFIX,
): string {
  if (!latestInvoiceNumber) {
    return generateInvoiceNumber({ prefix });
  }

  const parts = latestInvoiceNumber.split("-");

  if (parts.length !== 3) {
    return generateInvoiceNumber({ prefix });
  }

  const [, year, sequence] = parts;

  const currentYear = new Date().getFullYear();

  if (Number(year) !== currentYear) {
    return generateInvoiceNumber({
      prefix,
      sequence: 1,
    });
  }

  const nextSequence = Number(sequence) + 1;

  return generateInvoiceNumber({
    prefix,
    sequence: Number.isNaN(nextSequence) ? 1 : nextSequence,
  });
}
