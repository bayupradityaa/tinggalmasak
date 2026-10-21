export interface Env {
  // LLM (OpenAI-compatible, vision). Default: 9router
  LLM_API_KEY: string
  /** Base URL LLM, mis. http://127.0.0.1:20128/v1 (9router) atau https://api.openai.com/v1 */
  LLM_BASE_URL?: string
  /** Model vision, mis. ngoding-aaa (9router) atau gpt-4o-mini */
  LLM_MODEL?: string
  /** Project URL Supabase, mis. https://xxxx.supabase.co */
  SUPABASE_URL?: string
  /** Anon / publishable key Supabase (aman dipakai di server, bukan service_role) */
  SUPABASE_ANON_KEY?: string
}
