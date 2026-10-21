import { ChefHat } from 'lucide-react'

export default function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-flame-500 text-on-accent shadow-glow">
        <ChefHat className="size-5" strokeWidth={2.2} />
      </span>
      <span className="font-display text-[1.0625rem] leading-none font-semibold tracking-[-0.01em] text-fg">
        lethimcook
        <span className="text-flame-600">.ai</span>
      </span>
    </span>
  )
}
