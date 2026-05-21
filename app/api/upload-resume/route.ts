import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Chunk text into smaller pieces
function chunkText(text: string, size: number = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(" "));
  }

  return chunks;
}

// ✅ Mock embedding generator (temporary for development)
async function getEmbedding(text: string): Promise<number[]> {
  return new Array(128).fill(0).map(() => Math.random());
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Receive uploaded file from UI
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // ✅ Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ Dynamic values (generic for any candidate)
    const resumeId = crypto.randomUUID();

    const candidateName =
      file.name.replace(".pdf", "") || "Unknown Candidate";

    // ✅ Extract PDF text safely
    let text = "";

    try {
      const data = await pdf(buffer);
      text = data.text;
    } catch (err) {
      console.error("PDF parsing failed:", err);

      return NextResponse.json(
        { error: "Invalid PDF (cannot parse text)" },
        { status: 400 }
      );
    }

    // ✅ Empty text validation
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Empty resume text" },
        { status: 400 }
      );
    }

    // ✅ Chunk the resume text
    const chunks = chunkText(text, 100);

    // ✅ Store chunks + embeddings in Supabase
    for (const chunk of chunks) {
      const emb = await getEmbedding(chunk);

       console.log("Uploading chunk:", chunk);
      console.log("Embedding size:", emb.length);

      const { error } = await supabase
        .from("resume_chunks")
        .insert({
          resume_id: resumeId,
          candidate_name: candidateName,
          chunk_text: chunk,
          embedding: emb,
        });
     
      if (error) {
        console.error("Supabase insert error:", error);
      
        console.log("Inserted successfully");

        return NextResponse.json(
          { error: "Database insert failed" },
          { status: 500 }
        );
      }
    }

    // ✅ Success response
    return NextResponse.json({
      success: true,
      message: "Resume processed and stored successfully",
      candidateName,
      resumeId,
      chunkCount: chunks.length,
    });

  } catch (err: any) {
    console.error("❌ Error:", err);

    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}