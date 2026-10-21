import type { Ingredient } from '../types/recipe'

const CONFIDENCE = {
  Tinggi: 'bg-flame-500',
  Sedang: 'bg-amber-400',
  Rendah: 'bg-fg-faint',
} as const

export default function IngredientChip({ ingredient }: { ingredient: Ingredient }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 py-1.5 pr-3.5 pl-3 text-sm text-fg-soft">
      {ingredient.confidence && (
        <span
          aria-hidden
          title={`Keyakinan: ${ingredient.confidence}`}
          className={`size-1.5 rounded-full ${CONFIDENCE[ingredient.confidence] ?? CONFIDENCE.Rendah}`}
        />
      )}
      <span className="font-medium">{ingredient.name}</span>
      {ingredient.estimatedQuantity && (
        <span className="text-fg-faint">{ingredient.estimatedQuantity}</span>
      )}
    </li>
  )
}
