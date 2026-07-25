"use client";

import type { WizardQuestion } from "@/lib/types";
import {
  isChipSelected,
  toggleChipInAnswer,
  type WizardAnswerKey,
} from "@/lib/onboarding/wizardQuestions";
import { TrendSuggestionPanel } from "@/components/TrendSuggestionPanel";
import { INPUT_FIELD } from "@/lib/ui/theme";

interface WizardQuestionFieldProps {
  question: WizardQuestion;
  value: string;
  onChange: (value: string) => void;
  nische?: string;
  referentCreator?: string;
}

export function WizardQuestionField({
  question,
  value,
  onChange,
  nische = "",
  referentCreator = "",
}: WizardQuestionFieldProps) {
  return (
    <div className="space-y-4">
      {question.hint && (
        <p className="text-sm text-[var(--muted-strong)] bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2.5 leading-relaxed">
          {question.hint}
        </p>
      )}

      {question.selectOptions && question.selectOptions.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`select-${question.id}`}>
            Schnellauswahl
          </label>
          <select
            id={`select-${question.id}`}
            className={`${INPUT_FIELD} text-sm`}
            value={
              question.selectOptions.find((o) => o.value === value)?.value ?? ""
            }
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
          >
            <option value="">— Vorlage wählen —</option>
            {question.selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {question.selectOptions.map(
            (opt) =>
              opt.detail &&
              value === opt.value && (
                <p key={opt.value} className="text-xs opacity-70">
                  {opt.detail}
                </p>
              )
          )}
        </div>
      )}

      {question.chipOptions && question.chipOptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Optionen anklicken (Mehrfachauswahl)</p>
          <div className="flex flex-wrap gap-2">
            {question.chipOptions.map((chip) => {
              const active = isChipSelected(value, chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onChange(toggleChipInAnswer(value, chip))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-[var(--foreground)]/40 bg-[var(--accent)]/25 text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted-strong)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {nische.trim() && (
        <TrendSuggestionPanel
          key={question.id}
          nische={nische}
          referentCreator={referentCreator}
          questionId={question.id as WizardAnswerKey}
          onAccept={(v) => onChange(v)}
        />
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={`answer-${question.id}`}>
          {question.chipOptions?.length || question.selectOptions?.length
            ? "Antwort (anpassen oder ergänzen)"
            : "Deine Antwort"}
        </label>
        <textarea
          id={`answer-${question.id}`}
          className={`${INPUT_FIELD} min-h-[120px] resize-y`}
          placeholder={question.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

