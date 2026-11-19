/** lei → integer bani. All price arithmetic is done in integers, never on floats. */
export const toBani = (lei: number | string): number =>
  Math.round(Number(lei) * 100);
export const fromBani = (bani: number): number => bani / 100;

export interface QuoteAmounts {
  /** lei */
  subtotal: number;
  processingFee: number;
  total: number;
}

/** price = rate × lessons + fee (in bani). Mirrored by the FE's calculate-quote.ts for instant display. */
export function calculateQuoteAmounts(input: {
  rate: number | string;
  lessons: number;
  fee: number | string;
}): QuoteAmounts {
  const rateBani = toBani(input.rate);
  const feeBani = toBani(input.fee);
  const lessonsBani = rateBani * input.lessons;
  const totalBani = lessonsBani + feeBani;
  if (!Number.isSafeInteger(totalBani))
    throw new Error('Quote total out of range');
  return {
    subtotal: fromBani(lessonsBani),
    processingFee: fromBani(feeBani),
    total: fromBani(totalBani),
  };
}

/** Allowed lesson counts: integer, within [min, max], on the step grid starting at min. */
export function isValidLessonCount(
  lessons: number,
  s: { minLessons: number; maxLessons: number; lessonStep: number },
): boolean {
  return (
    Number.isInteger(lessons) &&
    lessons >= s.minLessons &&
    lessons <= s.maxLessons &&
    (lessons - s.minLessons) % s.lessonStep === 0
  );
}
