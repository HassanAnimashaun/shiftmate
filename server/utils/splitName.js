export function splitName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);

  return {
    firstName: parts[0] || "",
    // Use the remainder of the tokens as the last name (handles middle names too)
    lastName: parts.slice(1).join(" ").trim(),
  };
}
