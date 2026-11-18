// The Add Service dialog's fields, kept out of `Services.tsx` so neither file
// grows past the project's 200-line limit.
//
// Shape agreed before building (standing rule): Category, Name, Duration,
// Base price, Level, Allow group + Max participants, Home service,
// Description, Inclusions, Active.
//
// Everything here is **create-only**. The API has no service edit route — the
// provider owns the wording (§4.5) — so the dialog is only ever used to add.

import type { FieldDef } from '../Common/CrudPage';
import type { CatalogService } from '../../Services/catalog.api';

const LEVELS = [
  { value: 'ALL_LEVELS', label: 'All levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

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
      help: 'Per session, per person. Every package percent and group slab is applied to this.',
    },
    {
      name: 'level',
      label: 'Level',
      type: 'select',
      options: LEVELS,
      defaultValue: 'ALL_LEVELS',
    },
    {
      // The two pricing systems never meet: off means packages and one
      // person, on means group slabs and no package.
      name: 'allowMultiPerson',
      label: 'Group booking (prices by slab)',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'maxParticipants',
      label: 'Max participants',
      type: 'number',
      defaultValue: 1,
      help: 'Only for a group service, and then at least 2. Leave at 1 otherwise.',
    },
    {
      name: 'isHomeService',
      label: 'Home service',
      type: 'checkbox',
      defaultValue: true,
    },
    { name: 'description', label: 'Description', type: 'textarea', wide: true },
    { name: 'inclusions', label: 'Inclusions', type: 'textarea', wide: true },
    { name: 'isActive', label: 'Visible to customers', type: 'checkbox', defaultValue: true },
  ];
}
