// Student email gating. Accepts common academic TLDs so the gate works for
// US (.edu), UK (.ac.uk), AU (.edu.au), NZ (.ac.nz), etc. This is a signup-
// time heuristic; it's not a substitute for a real identity check, but it
// blocks casual non-student signups and lets us surface a "Verified student"
// badge driven by the persisted schoolDomain.

const ACADEMIC_SUFFIXES = [
  '.edu',
  '.edu.au',
  '.edu.sg',
  '.ac.uk',
  '.ac.nz',
  '.ac.jp',
  '.ac.kr',
  '.ac.in',
];

export function extractDomain(email: string): string | null {
  const at = email.indexOf('@');
  if (at < 0) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain || null;
}

export function isStudentEmail(email: string): boolean {
  const domain = extractDomain(email);
  if (!domain) return false;
  return ACADEMIC_SUFFIXES.some((suffix) => domain.endsWith(suffix));
}

export function schoolLabelFromDomain(domain: string | undefined | null): string | null {
  if (!domain) return null;
  // berkeley.edu → "berkeley.edu" (UI can pretty-print if it wants to).
  return domain.toLowerCase();
}
