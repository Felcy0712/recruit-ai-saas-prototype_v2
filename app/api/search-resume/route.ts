import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Mock embedding generator (temporary for development)
async function getEmbedding(text: string): Promise<number[]> {
  return new Array(128).fill(0).map(() => Math.random());
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Read request body
    const body = await req.json();

    const { jdText } = body;

    // ✅ Validate input
    if (!jdText) {
      return NextResponse.json(
        { error: "Missing jdText" },
        { status: 400 }
      );
    }

    // ✅ Convert JD text into embedding vector
    const queryEmbedding = await getEmbedding(jdText);

    // ✅ Search matching resume chunks from Supabase
    const { data, error } = await supabase.rpc(
      "match_resume_chunks",
      {
        query_embedding: queryEmbedding,
        match_threshold: -1,
        match_count: 5,
      }
    );

    // ✅ Handle search errors
    if (error) {
      console.error("Search error:", error);

      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      );
    }

    // ✅ Send retrieved matches to n8n AI workflow
    const n8nResponse = await fetch(
      "http://localhost:5678/webhook/a8edd7a7-85aa-48a7-8206-5f2cfea4faab",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jd: jdText,
          matches: data,
        }),
      }
    );

    // ✅ Parse AI workflow response
    const aiResult = await n8nResponse.json();

    // ✅ Return final response
    return NextResponse.json({
      success: true,
      matches: data,
      aiAnalysis: aiResult,
    });

  } catch (err: any) {
    console.error("❌ Error:", err);

    return NextResponse.json(
      {
        error: "Failed to search resumes",
      },
      {
        status: 500,
      }
    );
  }
}