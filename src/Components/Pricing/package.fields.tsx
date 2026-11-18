// The Add / Edit Package dialog's fields, kept out of `Packages.tsx` so
// neither file grows past the project's 200-line limit.
//
// Shape agreed before building (standing rule): Name, Icon, Category,
// Services, Sessions, Persons, Free sessions, Validity, Percent adjust,
// Allowed weekdays, Fixed trainer, Sort order, Active.
//
// **Services and Persons both landed 18 Nov 2026** (client): a package names
// the services it is sold on and carries its own head count, which is what
// replaced Group Slabs. → state/pricing-rules.md
//
// **Category is a filter, not a field** (client, 18 Nov 2026): it narrows the
// Services list and is `transient`, so it never reaches the API — which runs
// `forbidNonWhitelisted` and would refuse it. Weekdays are seven checkboxes.

import type { FieldDef, FieldOption } from '../Common/CrudPage';
import type { Package } from '../../Services/pricing.api';

export interface ServiceOption extends FieldOption {
  categoryId: string;
}

const WEEKDAYS: FieldOption[] = [
  { value: '0', label: 'Sun' },
  { value: '1', label: 'Mon' },
  { value: '2', label: 'Tue' },
  { value: '3', label: 'Wed' },
  { value: '4', label: 'Thu' },
  { value: '5', label: 'Fri' },
  { value: '6', label: 'Sat' },
];

/**
 * Categories and services are loaded by the screen and passed in, so both
 * lists are the live catalogue rather than a second copy of it.
 */
export function packageFields(
  categories: FieldOption[],
  services: ServiceOption[],
): FieldDef<Package>[] {
  return [
    { name: 'name', label: 'Name', required: true },
    {
      // Decoration on the website card, as Membership Plans carried. Empty
      // clears it and the card falls back to its own mark.
      name: 'icon',
      label: 'Icon / symbol',
      placeholder: '🔥',
      help: 'One emoji or symbol, shown on the package card. Leave empty for the default mark.',
      readValue: (row) => row.icon ?? '',
    },
    {
      name: 'categoryFilter',
      label: 'Category',
      type: 'select',
      options: categories,
      transient: true,
      help: 'Narrows the Services list below. Leave empty to see every service.',
    },
    {
      name: 'serviceIds',
      label: 'Services',
      type: 'multiselect',
      // Narrowed by the Category above; empty category means the lot.
      options: (form) =>
        services.filter(
          (s) => !form.categoryFilter || s.categoryId === form.categoryFilter,
        ),
      wide: true,
      help: 'Ctrl / Cmd-click to pick several. A package with no service ticked is sold nowhere.',
      readValue: (row) => (row.services ?? []).map((s) => s.id).join(','),
    },
    {
      name: 'sessionCount',
      label: 'Sessions',
      type: 'number',
      required: true,
      defaultValue: 1,
      help: 'Sessions the customer pays for.',
    },
    {
      name: 'persons',
      label: 'Persons per session',
      type: 'number',
      required: true,
      defaultValue: 1,
      help: 'The rate is per person, so this multiplies the price. Above 1 makes it a group package.',
    },
    {
      name: 'freeSessionCount',
      label: 'Free sessions',
      type: 'number',
      defaultValue: 0,
      help: 'Delivered on top, charged to nobody and paid to nobody — the trial is 1 + 1.',
    },
    {
      name: 'validityDays',
      label: 'Validity (days)',
      type: 'number',
      required: true,
      defaultValue: 30,
    },
    {
      name: 'percentAdjust',
      label: 'Percent adjust',
      type: 'number',
      defaultValue: 0,
      help: 'Signed, applied to rate x persons x sessions. +20 is the trial markup, -20 a group discount.',
    },
    {
      name: 'allowedWeekdays',
      label: 'Allowed weekdays',
      type: 'checkboxes',
      options: WEEKDAYS,
      wide: true,
      help: 'Tick none for any weekday.',
      readValue: (row) => row.allowedWeekdays.join(','),
    },
    {
      name: 'fixedInstructorAllowed',
      label: 'Fixed trainer allowed',
      type: 'checkbox',
      defaultValue: true,
    },
    { name: 'sortOrder', label: 'Sort order', type: 'number', defaultValue: 0 },
    {
      // Status moves through its own audited route once the row exists, so the
      // checkbox is only offered while creating.
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
      createOnly: true,
    },
  ];
}
