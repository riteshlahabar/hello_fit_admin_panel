// The Add / Edit Service dialog fields, kept out of `Services.tsx` so neither
// file grows past the project's 200-line limit.
//
// Shape agreed before building (standing rule): Category, Name, Duration,
// Base price, Description, Visible.
//
// **A service carries no head count, level, home-service flag or inclusions**
// — the client dropped all four on 18 Nov 2026. `persons` lives on the
// Package now, which is also the only discount there is.
// → state/pricing-rules.md

import type { FieldDef } from '../Common/CrudPage';
import type { CatalogService } from '../../Services/catalog.api';

/**
 * Categories are loaded by the screen and passed in, so the dropdown is the
 * live list rather than a second copy of it.
 */
export function serviceFields(
  categories: { value: string; label: string }[],
): FieldDef<CatalogService>[] {
  return [
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      options: categories,
      required: true,
    },
    { name: 'name', label: 'Name', required: true },
    {
      name: 'durationMin',
      label: 'Duration (minutes)',
      type: 'number',
      required: true,
      defaultValue: 60,
      help: '15 to 480 minutes.',
    },
    {
      name: 'basePrice',
      label: 'Base price (₹)',
      type: 'number',
      required: true,
      defaultValue: 0,
      help: 'Per session, per person. Every package percent is applied to this.',
    },
    { name: 'description', label: 'Description', type: 'textarea', wide: true },
    {
      name: 'isActive',
      label: 'Visible to customers',
      type: 'checkbox',
      defaultValue: true,
    },
  ];
}
