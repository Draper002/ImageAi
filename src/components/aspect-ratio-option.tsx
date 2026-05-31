type AspectRatioOptionProps = {
  value: string;
  label: string;
  shape: string;
  selected?: boolean;
  onChange?: (value: string) => void;
};

export function AspectRatioOption({ value, label, shape, selected = false, onChange }: AspectRatioOptionProps) {
  return (
    <label className={`ratio-option ${selected ? "is-selected" : ""}`}>
      <input
        type="radio"
        name="aspectRatio"
        value={value}
        checked={selected}
        onClick={() => onChange?.(value)}
        onChange={() => undefined}
      />
      <span aria-label={`${label} aspect ratio preview`} data-shape={shape} className={`ratio-shape ratio-${shape}`} />
      <span>{label}</span>
    </label>
  );
}
