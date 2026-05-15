export function readCreditBalance(profile: { credit_balance: number | null } | null): number {
  return profile?.credit_balance ?? 0;
}
