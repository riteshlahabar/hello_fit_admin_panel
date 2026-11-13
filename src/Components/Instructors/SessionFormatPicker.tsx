// Where a provider will hold sessions — PDF §4.5 is theirs to set, §5.5's
// "Session location" filter on the website is what reads it.
//
// Ops set it from here because `instructor_app/` is still a bare scaffold, so
// no provider can set their own yet.

import { SESSION_FORMATS, type SessionFormat } from '../../Services/instructors.api';

interface Props {
  value: SessionFormat[];
  disabled: boolean;
  onToggle: (format: SessionFormat) => void;
}

const SessionFormatPicker = ({ value, disabled, onToggle }: Props) => (
  <div className='mb-3'>
    <div className='f-w-600 mb-1'>Session locations</div>
    <span className='f-light f-12 d-block mb-2'>
      Where this trainer works. The website&apos;s Find a Trainer filter reads this.
    </span>
    <div className='d-flex gap-3 flex-wrap'>
      {SESSION_FORMATS.map((option) => (
        <label key={option.value} className='d-flex align-items-center gap-2 mb-0'>
          <input
            type='checkbox'
            checked={value.includes(option.value)}
            disabled={disabled}
            onChange={() => onToggle(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default SessionFormatPicker;
