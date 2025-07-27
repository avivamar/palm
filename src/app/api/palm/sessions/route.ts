import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/firebase/auth";
import { getSafeDB } from "@/libs/DB";
import { palmAnalysisSessionsSchema, userImagesSchema } from "@/models/Schema";
import { nanoid } from "nanoid";
import { z } from "zod";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";

// Request validation schema
const CreateSessionSchema = z.object({
  handType: z.enum(["left", "right", "both"]),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
  analysisType: z.enum(["quick", "full"]),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const sessionData = JSON.parse(formData.get("data") as string);

    // Validate image
    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Validate image type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Validate image size (max 10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    // Validate session data
    const validatedData = CreateSessionSchema.parse(sessionData);

    // Upload image to Vercel Blob
    const imageBuffer = await image.arrayBuffer();
    const fileName = `palm-${nanoid()}-${image.name}`;
    
    const blob = await put(fileName, imageBuffer, {
      access: "public",
      contentType: image.type,
    });

    // Save image to database
    const db = await getSafeDB();
    const [savedImage] = await db
      .insert(userImagesSchema)
      .values({
        userId: user.uid,
        fileName: image.name,
        fileSize: image.size,
        mimeType: image.type as any,
        url: blob.url,
        r2Key: fileName,
        description: "Palm reading image",
        tags: ["palm", "analysis"],
      })
      .returning();

    // Create analysis session
    const sessionId = nanoid();
    const [session] = await db
      .insert(palmAnalysisSessionsSchema)
      .values({
        id: sessionId,
        userId: user.uid,
        imageId: savedImage.id,
        status: "pending",
        handType: validatedData.handType,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        birthTime: validatedData.birthTime || null,
        birthLocation: validatedData.birthLocation || null,
        conversionStep: "uploaded",
      })
      .returning();

    // TODO: Trigger background analysis job
    // This would typically be done via a queue system like Bull/BullMQ
    // For now, we'll return the session and handle analysis separately

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      imageUrl: blob.url,
      analysisType: validatedData.analysisType,
      message: "Analysis session created successfully",
    });

  } catch (error) {
    console.error("Create session error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's analysis sessions
    const db = await getSafeDB();
    const sessions = await db
      .select({
        id: palmAnalysisSessionsSchema.id,
        status: palmAnalysisSessionsSchema.status,
        analysisType: palmAnalysisSessionsSchema.analysisType,
        conversionStep: palmAnalysisSessionsSchema.conversionStep,
        createdAt: palmAnalysisSessionsSchema.createdAt,
        updatedAt: palmAnalysisSessionsSchema.updatedAt,
        leftHandImageUrl: palmAnalysisSessionsSchema.leftHandImageUrl,
        rightHandImageUrl: palmAnalysisSessionsSchema.rightHandImageUrl,
      })
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.userId, user.uid))
      .orderBy(palmAnalysisSessionsSchema.createdAt);

    return NextResponse.json({
      success: true,
      sessions,
    });

  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}