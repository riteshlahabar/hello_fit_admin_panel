// The Add / Edit Package dialog's fields, kept out of `Packages.tsx` so
// neither file grows past the project's 200-line limit.
//
// Shape agreed before building (standing rule): Name, Icon, Services,
// Sessions, Persons, Free sessions, Validity, Percent adjust, Allowed
// weekdays, Fixed trainer, Sort order, Active.
//
// **Services and Persons both landed 18 Nov 2026** (client): a package names
// the services it is sold on and carries its own head count, which is what
// replaced Group Slabs. → state/pricing-rules.md

import type { FieldDef } from '../Common/CrudPage';
import type { Package } from '../../Services/pricing.api';

/**
 * Services are loaded by the screen and passed in, so the multi-select is
 * the live catalogue rather than a second copy of it.
 */
export function packageFields(
  services: { value: string; label: string }[],
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
      name: 'serviceIds',
      label: 'Services',
      type: 'multiselect',
      options: services,
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
      placeholder: '1,3,5',
      wide: true,
      help: '0 = Sunday to 6 = Saturday, comma separated. Leave empty for any weekday.',
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
