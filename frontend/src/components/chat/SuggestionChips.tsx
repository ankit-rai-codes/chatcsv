"use client";

export function SuggestionChips({
  items,
  onPick,
  disabled,
}: {
  items: string[];
  onPick: (question: string) => void;
  disabled?: boolean;
}) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((q) => (
        <li key={q}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPick(q)}
            className="rounded-full border border-rule bg-surface px-3 py-1.5 text-left text-xs hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}
