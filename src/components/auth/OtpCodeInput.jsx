import { useMemo, useRef } from 'react';

const DIGIT_LENGTH = 6;

const buildOtpArray = (value = '', length = DIGIT_LENGTH) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, length);
  return Array.from({ length }, (_, index) => digits[index] || '');
};

export const OtpCodeInput = ({
  autoFocus = false,
  disabled = false,
  length = DIGIT_LENGTH,
  onChange,
  value = '',
}) => {
  const inputRefs = useRef([]);
  const digits = useMemo(() => buildOtpArray(value, length), [length, value]);

  const emitChange = (nextDigits) => {
    onChange(nextDigits.join('').replace(/\s/g, ''));
  };

  const focusInput = (index) => {
    const nextInput = inputRefs.current[index];

    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  };

  const updateDigit = (index, rawValue) => {
    const nextDigits = [...digits];
    const cleanDigits = String(rawValue || '').replace(/\D/g, '');

    if (!cleanDigits) {
      nextDigits[index] = '';
      emitChange(nextDigits);
      return;
    }

    cleanDigits.split('').forEach((digit, offset) => {
      const targetIndex = index + offset;

      if (targetIndex < length) {
        nextDigits[targetIndex] = digit;
      }
    });

    emitChange(nextDigits);
    focusInput(Math.min(index + cleanDigits.length, length - 1));
  };

  return (
    <div className="otp-code-input" role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <input
          aria-label={`Digit ${index + 1}`}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          className="otp-digit"
          disabled={disabled}
          inputMode="numeric"
          key={`otp-${index}`}
          maxLength={1}
          onChange={(event) => updateDigit(index, event.target.value)}
          onFocus={(event) => event.target.select()}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index] && index > 0) {
              focusInput(index - 1);
            }

            if (event.key === 'ArrowLeft' && index > 0) {
              event.preventDefault();
              focusInput(index - 1);
            }

            if (event.key === 'ArrowRight' && index < length - 1) {
              event.preventDefault();
              focusInput(index + 1);
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            updateDigit(index, event.clipboardData.getData('text'));
          }}
          pattern="\d*"
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          value={digit}
        />
      ))}
    </div>
  );
};
