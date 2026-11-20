import { Fragment, useState, type ReactNode } from 'react';
import { MoreVertical } from 'react-feather';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

/**
 * The per-row dots menu, lifted out of `CrudPage` so it can hold state.
 *
 * **Why it is not `UncontrolledDropdown`.** The row actions it lists are whole
 * panels — Documents, Services, Stage — and each renders its own `Modal`.
 * Reactstrap portals a modal to `document.body`, which is *outside* the
 * dropdown's own DOM, so the dropdown's document-level handler read every
 * click inside those modals as a click outside itself and closed. Closing
 * unmounts `rowActions`, and the modal with it — and because that handler runs
 * in the capture phase, it got there before React dispatched the click to the
 * button. The modal vanished and the button's `onClick` never ran: View,
 * Verify and Reject all did nothing at all.
 *
 * So the toggle ignores any click that came from inside a modal. Everything
 * else — the toggle itself, an item, a click on the page — closes the menu as
 * before.
 */
export function RowMenu({
  children,
  danger,
}: {
  children: ReactNode;
  /** The destructive item, rendered under a divider. Omitted when not allowed. */
  danger?: { label: string; onClick: () => void };
}) {
  const [open, setOpen] = useState(false);

  const toggle = (event?: { target?: EventTarget | null }) => {
    const target = event?.target;
    if (target instanceof Element && target.closest('.modal')) return;
    setOpen((was) => !was);
  };

  return (
    <Dropdown isOpen={open} toggle={toggle}>
      <DropdownToggle
        color='link'
        size='sm'
        className='hf-row-menu'
        aria-label='Row actions'>
        <MoreVertical />
      </DropdownToggle>
      <DropdownMenu end className='hf-row-menu-pop'>
        {children}
        {danger ? (
          <Fragment>
            <DropdownItem divider />
            {/* Not `.txt-danger`: Cuba defines that only in its prebuilt
                color.css, which the panel does not compile. */}
            <DropdownItem className='hf-menu-danger' onClick={danger.onClick}>
              {danger.label}
            </DropdownItem>
          </Fragment>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}
