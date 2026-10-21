export interface AnalyzeRequest {
  /**
   * Data gambar dalam format base64 data URL
   * Contoh: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
   */
  image: string
  /**
   * Catatan tambahan opsional dari pengguna (misal: "tanpa minyak", "pedas")
   */
  notes?: string
}

export interface Ingredient {
  name: string
  estimatedQuantity?: string
  confidence?: 'Tinggi' | 'Sedang' | 'Rendah'
}

export interface RecipeSuggestion {
  id: string
  title: string
  description?: string
  prepTime?: string
  cookTime?: string
  difficulty?: string
  caloriesApprox?: string
  ingredientsUsed?: string[]
  additionalIngredientsNeeded?: string[]
  steps?: string[]
  chefTips?: string
}

export interface AnalyzeResponse {
  success: boolean
  detectedIngredients: Ingredient[]
  recipes: RecipeSuggestion[]
  rawExplanation?: string
  error?: string
}
