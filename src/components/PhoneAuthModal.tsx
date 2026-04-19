/**
 * PhoneAuthModal — Phone OTP auth modal.
 * Phone authentication is currently disabled. This file is kept to avoid
 * breaking any imports, but the component will never be rendered.
 */
interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhoneAuthModal({ isOpen }: PhoneAuthModalProps) {
  if (!isOpen) return null;
  return null;
}
