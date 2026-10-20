interface Env {
  LLM_API_KEY: string
  LLM_BASE_URL?: string
  LLM_MODEL?: string
}

interface RequestPayload {
  image?: string
  notes?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // 1. Validasi API Key
  const apiKey = env.LLM_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'LLM_API_KEY belum dikonfigurasi di environment server.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Parse Body Request
  let body: RequestPayload
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Format body request tidak valid (harus JSON).',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!body.image) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Data gambar (base64) wajib disertakan.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 3. Konfigurasi Endpoint & Model LLM
  const rawBaseUrl = env.LLM_BASE_URL || 'https://api.openai.com/v1'
  const baseUrl = rawBaseUrl.replace(/\/+$/, '')
  const model = env.LLM_MODEL || 'gpt-4o-mini'

  // Pastikan format URL gambar valid (base64 data URL)
  let imageUrl = body.image
  if (!imageUrl.startsWith('data:image/')) {
    imageUrl = `data:image/jpeg;base64,${imageUrl}`
  }

  const systemPrompt = `Anda adalah Chef & Ahli Kuliner Cerdas untuk 'tinggalmasak.ai.id'.
Tugas Anda:
1. Teliti dan kenali seluruh bahan makanan, bumbu dapur, atau sayur/daging yang tampak pada foto.
2. Buat 2 hingga 3 rekomendasi resep masakan lezat, praktis, dan cocok untuk masakan rumahan Indonesia berdasarkan bahan-bahan tersebut.
3. Berikan informasi estimasi waktu, tingkat kesulitan, langkah-langkah memasak yang runtut, dan tips chef.
4. Anda WAJIB mengembalikan output HANYA dalam format JSON valid tanpa markdown blok \`\`\`json.

Format JSON yang diwajibkan:
{
  "detectedIngredients": [
    { "name": "Nama Bahan", "estimatedQuantity": "Estimasi jumlah/potong", "confidence": "Tinggi" }
  ],
  "recipes": [
    {
      "id": "resep-1",
      "title": "Nama Resep Masakan",
      "description": "Deskripsi singkat menggugah selera",
      "prepTime": "10 menit",
      "cookTime": "20 menit",
      "difficulty": "Mudah",
      "caloriesApprox": "350 kkal",
      "ingredientsUsed": ["Bahan yang terdeteksi"],
      "additionalIngredientsNeeded": ["Bumbu pelengkap umum seperti garam/minyak"],
      "steps": [
        "Langkah 1...",
        "Langkah 2..."
      ],
      "chefTips": "Tips rahasia agar masakan makin lezat"
    }
  ]
}`

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    {
      type: 'text',
      text: body.notes
        ? `Tolong analisis foto bahan ini. Catatan pengguna: ${body.notes}`
        : 'Tolong analisis foto bahan makanan ini dan berikan resep masakan yang bisa dibuat.',
    },
    {
      type: 'image_url',
      image_url: {
        url: imageUrl,
      },
    },
  ]

  // 4. Kirim Request ke LLM API (OpenAI Compatible Format)
  try {
    const llmResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!llmResponse.ok) {
      const errText = await llmResponse.text()
      return new Response(
        JSON.stringify({
          success: false,
          error: `Panggilan ke LLM gagal (${llmResponse.status}): ${errText}`,
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const llmData: any = await llmResponse.json()
    const rawContent = llmData.choices?.[0]?.message?.content

    if (!rawContent) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'LLM tidak mengembalikan konten respons.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse hasil JSON dari LLM
    const parsedResult = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent

    return new Response(
      JSON.stringify({
        success: true,
        detectedIngredients: parsedResult.detectedIngredients || [],
        recipes: parsedResult.recipes || [],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Terjadi kesalahan internal saat memproses resep.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
