// Real issues exist for real units (verified: 16 rows for the test account's unit
// alone), but no RLS policy currently grants residents SELECT on `issues`, only
// property managers and runners. Until that's fixed, a live query here would show
// a false "all clear" instead of what residents would actually see once the
// policy exists. This fixture matches the real schema/enum exactly, see
// CLAUDE.md and lib/queries.js (listUnitIssues, unused by this screen for now).
export const MOCK_ISSUES = [
  {
    id: 'mock-1',
    title: 'Bag overflowing at pickup',
    description: 'Trash bag was overfilled and split at the curb.',
    image_url: 'https://placehold.co/600x400/2F6B4F/FFFFFF?text=Photo+preview',
    status: 'bag_overflowing',
    created_at: '2026-06-29T21:15:00.000Z',
  },
  {
    id: 'mock-2',
    title: 'Extra items left in can',
    description: 'A cardboard box was left outside the bin, not inside it.',
    image_url: 'https://placehold.co/600x400/8A5A00/FFFFFF?text=Photo+preview',
    status: 'ancillary_items_in_can',
    created_at: '2026-06-24T20:40:00.000Z',
  },
  {
    id: 'mock-3',
    title: 'Bag torn open',
    description: null,
    image_url: 'https://placehold.co/600x400/2F6B4F/FFFFFF?text=Photo+preview',
    status: 'hole_in_bag',
    created_at: '2026-06-15T19:55:00.000Z',
  },
];
