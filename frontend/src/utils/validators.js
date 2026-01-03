export function required(val) {
  return val ? null : 'This field is required'
}

export function minLen(val, len) {
  return val && val.length >= len ? null : `Minimum ${len} characters`
}

export function passwordValid(val) {
  if (!val) return 'This field is required'
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*\(\)_\+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
  return re.test(val) ? null : 'Password must be 8+ chars with upper, lower, number and special char'
}