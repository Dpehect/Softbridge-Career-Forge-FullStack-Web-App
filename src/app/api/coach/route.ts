import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages, cvContext, lang } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ fallback: true, reason: "API key missing" });
    }

    // Map message roles: assistant -> model
    const contents = (messages || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const systemPrompt = lang === "tr"
      ? `Sen CareerForge için "Smart Career Coach" (Akıllı Kariyer Koçu) adında profesyonel bir kariyer asistanısın.
Kullanıcının CV bilgilerine ve hedeflerine dayanarak mülakat hazırlığı, ATS uyumluluğu, deneyim maddelerini STAR formatında yazma ve maaş pazarlığı konularında dürüst, profesyonel ve yasal tavsiyeler ver.

Kural ve Kısıtlamalar:
1. Kesinlikle emoji kullanma.
2. Sadece Türkçe yanıt ver. PDF, ATS, API gibi teknik terimleri koru.
3. Rakamları ve metrikleri abartma veya uydurma; dürüstlüğü ve kanıta dayalı anlatımı teşvik et.
4. Yanıtlarını okunabilir ve sade bir markdown formatında (başlıklar için ### veya ####, listeler için - kullanarak) biçimlendir.
5. Kullanıcının CV verileri: ${JSON.stringify(cvContext || {})}`
      : `You are "Smart Career Coach", a professional career assistant for CareerForge.
Provide honest, professional, and evidence-based guidance on interview prep (STAR method), ATS optimization, resume statements, and salary negotiation based on the user's resume and goals.

Rules and Constraints:
1. Never use emojis.
2. Return all responses in English.
3. Encourage honesty; do not exaggerate or invent metrics.
4. Format your response cleanly using markdown (### or #### for headers, - for bullets).
5. User's resume context: ${JSON.stringify(cvContext || {})}`;

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ fallback: true, reason: "API response error" });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json({ fallback: true, reason: "Empty response" });
    }

    return NextResponse.json({
      fallback: false,
      reply: replyText,
      modelState: "AI active",
    });
  } catch (error) {
    console.error("Coach API route catch error:", error);
    return NextResponse.json({ fallback: true, reason: "Internal error" });
  }
}
