jest.mock('src/clients', () => ({}));

import {
  toFleetHighlightDto,
  type BodyTypeCount,
} from 'src/common/utils/landing-utils';
import { BodyType, TransmissionType, landingResponseSchema } from 'src/types';
import { LandingService } from './landing.service';

const ID = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
const highlight = (bodyTypes: BodyType[], n = 1) => ({
  id: ID(n),
  slug: `h-${n}`,
  name: 'Compacte și sedanuri',
  tagline: 't',
  description: 'd',
  bodyTypes,
  imageUrl: '/images/landing/x.webp',
  imageAlt: 'alt',
  highlightIcon: 'sensors',
  highlightLabel: 'Cameră 360°',
  specs: [
    { icon: 'speed', label: 'Răspuns precis', accent: 'secondary' as const },
  ],
});
const c = (
  bodyType: BodyType,
  transmission: TransmissionType,
  count: number | string,
): BodyTypeCount => ({
  bodyType,
  transmission,
  count,
});

describe('toFleetHighlightDto', () => {
  it('both transmissions → "Manual și automat", gold on mobile, counts summed across body types', () => {
    const dto = toFleetHighlightDto(
      highlight([BodyType.Compact, BodyType.Hatchback, BodyType.Sedan]),
      [
        c(BodyType.Compact, TransmissionType.Automatic, 1),
        c(BodyType.Hatchback, TransmissionType.Manual, '1'),
        c(BodyType.Sedan, TransmissionType.Automatic, 2),
        c(BodyType.Sedan, TransmissionType.Manual, 1),
        c(BodyType.Coupe, TransmissionType.Automatic, 1),
      ],
    );
    expect(dto).toMatchObject({
      carCount: 5,
      transmissions: ['manual', 'automatic'],
      badgeLabel: 'Manual și automat',
      badgeVariantMobile: 'primary',
    });
  });

  it('automatic only → "Doar automat", blue on mobile', () => {
    const dto = toFleetHighlightDto(highlight([BodyType.Suv]), [
      c(BodyType.Suv, TransmissionType.Automatic, 2),
    ]);
    expect(dto).toMatchObject({
      carCount: 2,
      transmissions: ['automatic'],
      badgeLabel: 'Doar automat',
      badgeVariantMobile: 'secondary',
    });
  });

  it('manual only → "Doar manual", gold on mobile', () => {
    const dto = toFleetHighlightDto(highlight([BodyType.Suv]), [
      c(BodyType.Suv, TransmissionType.Manual, 1),
    ]);
    expect(dto).toMatchObject({
      badgeLabel: 'Doar manual',
      badgeVariantMobile: 'primary',
    });
  });

  it('no matching cars → null (omitted)', () => {
    expect(
      toFleetHighlightDto(highlight([BodyType.Suv]), [
        c(BodyType.Sedan, TransmissionType.Manual, 3),
      ]),
    ).toBeNull();
  });
});

describe('LandingService.getLanding', () => {
  it('keys sections by key, omits empty highlights and matches the response schema', async () => {
    const section = (key: string) => ({
      key,
      eyebrow: null,
      eyebrowIcon: null,
      title: 'T',
      titleHighlight: null,
      titleSuffix: null,
      subtitle: null,
      primaryCtaLabel: null,
      primaryCtaHref: null,
      secondaryCtaLabel: null,
      secondaryCtaHref: null,
      secondaryCtaIcon: null,
      imageUrl: null,
      imageAlt: null,
      imageAltMobile: null,
      extra: {},
      showOnDesktop: true,
      showOnMobile: true,
    });
    const ops = {
      getSections: jest
        .fn()
        .mockResolvedValue([section('hero'), section('cta')]),
      getStats: jest.fn().mockResolvedValue([
        {
          id: ID(1),
          value: '95',
          suffix: '%',
          shortSuffix: null,
          label: 'Promovabilitate din prima',
          shortLabel: null,
          accent: 'primary',
          accentMobile: 'primary',
        },
      ]),
      getFeatures: jest.fn().mockResolvedValue([
        {
          id: ID(2),
          title: 'Precizie tehnică',
          description: 'd',
          icon: 'speed',
          iconMobile: 'tune',
          accent: 'secondary',
          tags: ['a', 'b'],
        },
      ]),
      getFleetHighlights: jest
        .fn()
        .mockResolvedValue([
          highlight([BodyType.Sedan], 3),
          highlight([BodyType.Suv], 4),
        ]),
      getFleetBodyTypeCounts: jest
        .fn()
        .mockResolvedValue([c(BodyType.Sedan, TransmissionType.Manual, '2')]),
      getFaqs: jest
        .fn()
        .mockResolvedValue([{ id: ID(5), question: 'Q?', answer: 'A.' }]),
      countFaqs: jest.fn(),
    };
    const out = await new LandingService(ops).getLanding();
    expect(Object.keys(out.sections)).toEqual(['hero', 'cta']);
    expect(out.fleetHighlights.map((h) => h.slug)).toEqual(['h-3']);
    expect(landingResponseSchema.safeParse(out).success).toBe(true);
  });
});
