export function validatePasswordStrength(password) {
  const errors = [];
  if (typeof password !== "string" || password.length < 10) errors.push("password must contain at least 10 characters");
  if (typeof password === "string" && !/[A-Z]/.test(password)) errors.push("password must include an uppercase letter");
  if (typeof password === "string" && !/[a-z]/.test(password)) errors.push("password must include a lowercase letter");
  if (typeof password === "string" && !/\d/.test(password)) errors.push("password must include a number");
  return errors;
}
