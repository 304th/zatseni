// Normalize Russian phone number to format: 7XXXXXXXXXX
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("8") && digits.length === 11) {
    return "7" + digits.slice(1);
  }
  if (digits.startsWith("7") && digits.length === 11) {
    return digits;
  }
  if (digits.length === 10) {
    return "7" + digits;
  }
  return digits;
}

// Validate phone format (must be 7 + 10 digits)
export function isValidRussianPhone(phone: string): boolean {
  return /^7\d{10}$/.test(phone);
}
