import { useId, useState } from 'react'
import { ChevronDown, Lightbulb, ListChecks } from 'lucide-react'
import type { RecipeSuggestion } from '../types/recipe'

/**
 * Kartu resep lipat: ringkas saat tertutup, langkah lengkap saat dibuka.
 * Satu kolom penuh supaya lima menu tidak meninggalkan ruang kosong.
 */
export default function RecipeCard({
  recipe,
  index,
  defaultOpen = false,
}: {
  recipe: RecipeSuggestion
  index: number
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  const meta = [
    recipe.prepTime && { label: 'Prep', value: recipe.prepTime },
    recipe.cookTime && { label: 'Masak', value: recipe.cookTime },
    recipe.caloriesApprox && { label: 'Kalori', value: recipe.caloriesApprox },
  ].filter((item): item is { label: string; value: string } => Boolean(item))

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-surface transition-colors ${
        open ? 'border-line-2 shadow-card' : 'border-line hover:border-line-2'
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
        >
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-flame-100 font-display text-sm font-semibold text-flame-300">
            {index + 1}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-display text-[1.0625rem] leading-snug font-medium tracking-[-0.01em] text-fg">
              {recipe.title}
            </span>

            {recipe.description && (
              <span className="mt-1 block text-sm leading-relaxed text-fg-muted">
                {recipe.description}
              </span>
            )}

            <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
              {meta.map((item) => (
                <span key={item.label} className="flex gap-1.5">
                  <span className="text-fg-faint">{item.label}</span>
                  <span className="text-fg-soft">{item.value}</span>
                </span>
              ))}
              {recipe.difficulty && (
                <span className="rounded-full border border-flame-300/30 bg-flame-100 px-2.5 py-0.5 text-[11px] font-medium text-flame-300">
                  {recipe.difficulty}
                </span>
              )}
            </span>
          </span>

          <ChevronDown
            className={`mt-1 size-4 shrink-0 text-fg-faint transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </h3>

      {open && (
        <div
          id={panelId}
          className="space-y-4 border-t border-line px-4 py-4 sm:px-5 sm:py-5"
        >
          {(recipe.ingredientsUsed?.length || recipe.additionalIngredientsNeeded?.length) && (
            <div className="space-y-2">
              {recipe.ingredientsUsed && recipe.ingredientsUsed.length > 0 && (
                <p className="text-xs text-fg-muted">
                  <span className="font-medium text-fg-soft">Pakai bahan ini:</span>{' '}
                  {recipe.ingredientsUsed.join(', ')}
                </p>
              )}
              {recipe.additionalIngredientsNeeded &&
                recipe.additionalIngredientsNeeded.length > 0 && (
                  <p className="text-xs text-fg-muted">
                    <span className="font-medium text-fg-soft">Perlu beli:</span>{' '}
                    {recipe.additionalIngredientsNeeded.join(', ')}
                  </p>
                )}
            </div>
          )}

          {recipe.steps && recipe.steps.length > 0 && (
            <div>
              <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-fg-muted uppercase">
                <ListChecks className="size-3.5 text-flame-300" />
                Langkah
              </p>
              <ol className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-fg-soft">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-fg-muted">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {recipe.chefTips && (
            <p className="flex gap-2.5 rounded-xl border border-flame-300/25 bg-flame-100 p-3 text-xs leading-relaxed text-flame-200">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-flame-300" />
              <span>
                <span className="font-semibold">Tips koki:</span> {recipe.chefTips}
              </span>
            </p>
          )}
        </div>
      )}
    </article>
  )
}
