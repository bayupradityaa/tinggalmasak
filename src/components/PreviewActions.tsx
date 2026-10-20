import { createContext, useContext } from 'react'

export interface PreviewActions {
  openUpload: () => void
  openLogin: () => void
}

export const PreviewActionsContext = createContext<PreviewActions>({
  openUpload: () => undefined,
  openLogin: () => undefined,
})

export function usePreviewActions() {
  return useContext(PreviewActionsContext)
}
