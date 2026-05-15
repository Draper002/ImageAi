export function CreditBadge({ credits }: { credits: number }) {
  return (
    <div className="credit-badge">
      <span>当前积分</span>
      <strong>{credits}</strong>
    </div>
  );
}
