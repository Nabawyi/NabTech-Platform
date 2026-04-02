export function validateEgyptianPhone(phone: string, fieldName: string = "رقم الهاتف"): { valid: boolean; error?: string } {
  const trimmed = phone.trim();
  
  if (!trimmed) {
    return { valid: false, error: `${fieldName} مطلوب` };
  }

  // Regex: starts with 01, followed by 0-5, then 8 digits. Total 11 digits.
  // No spaces inside allowed.
  const regex = /^01[0-5][0-9]{8}$/;
  
  if (!regex.test(trimmed)) {
    if (trimmed.length !== 11) {
      return { valid: false, error: `${fieldName} يجب أن يكون 11 رقم بالضبط` };
    }
    if (!trimmed.startsWith("01")) {
      return { valid: false, error: `${fieldName} يجب أن يبدأ بـ 01` };
    }
    return { valid: false, error: `${fieldName} غير صالح (يجب أن يبدأ بـ 010, 011, 012, أو 015)` };
  }

  return { valid: true };
}
