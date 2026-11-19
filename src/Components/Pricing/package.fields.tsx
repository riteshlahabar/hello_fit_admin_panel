// The Add / Edit Package dialog's fields, kept out of `Packages.tsx` so
// neither file grows past the project's 200-line limit.
//
// Shape agreed before building (standing rule): Name, Icon, Category,
// Services, Sessions, Persons, Free sessions, Validity, Percent adjust,
// Sort order, Allowed weekdays, Fixed trainer, Active.
//
// **Services and Persons both landed 18 Nov 2026** (client): a package names
// the services it is sold on and carries its own head count, which is what
// replaced Group Slabs. → state/pricing-rules.md
//
// **Category is a filter, not a field** (client, 18 Nov 2026): it picks the
// Services list and is `transient`, so it never reaches the API — which runs
// `forbidNonWhitelisted` and would refuse it. Weekdays are seven checkboxes.
//
// **Both are compulsory and the Services list is empty until a category is
// picked** (client, 19 Nov 2026). Compulsory on the API too: `serviceIds` is
// required with at least one id on create. → admin-package.dto.ts
//
// **Help text dropped from Icon, Category, Sessions, Persons and Free
// sessions** (client, 19 Nov 2026): the labels say it, and five extra lines
// were a third of the dialog's height. The three that remain each carry a
// rule the label cannot — how to multi-pick, what the sign means, and what no
// weekday ticked means.

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
      readValue: (row) => row.icon ?? '',
    },
    {
      name: 'categoryFilter',
      label: 'Category',
      type: 'select',
      options: categories,
      transient: true,
      required: true,
      // Transient, so an edit has nothing stored to read back. Derived from
      // the row's first service instead, or the Services list would open
      // empty on a package that plainly has services.
      readValue: (row) => {
        const first = (row.services ?? [])[0];
        return services.find((s) => s.value === first?.id)?.categoryId ?? '';
      },
    },
    {
      name: 'serviceIds',
      label: 'Services',
      type: 'multiselect',
      required: true,
      // Empty until a category is picked (client, 19 Nov 2026). Showing the
      // whole catalogue up front made the Category field pointless and the
      // list too long to read.
      options: (form) =>
        form.categoryFilter
          ? services.filter((s) => s.categoryId === form.categoryFilter)
          : [],
      // Half-width, beside Category (client, 19 Nov 2026) — full width made
      // the box far wider than the longest service name.
      help: 'Ctrl / Cmd-click to pick several. Pick a category above to fill this list.',
      readValue: (row) => (row.services ?? []).map((s) => s.id).join(','),
    },
    {
      name: 'sessionCount',
      label: 'Sessions',
      type: 'number',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'persons',
      label: 'Persons per session',
      type: 'number',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'freeSessionCount',
      label: 'Free sessions',
      type: 'number',
      defaultValue: 0,
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
    // Paired with Percent adjust on one row (client, 19 Nov 2026): two plain
    // numbers, and Percent was sitting alone next to the full-width weekdays.
    { name: 'sortOrder', label: 'Sort order', type: 'number', defaultValue: 0 },
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
