export function generateUsername(firstName = "", lastName = "") {
  const f = firstName.trim().toLowerCase();
  const l = lastName.trim().replace(/\s+/g, "").toLowerCase();

  if (f && l) {
    return f[0] + l;
  }

  if (f || l) {
    // If only one name part exists, fall back to it with a short random suffix.
    const base = f || l;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${base}${suffix}`;
  }

  return null;
}
