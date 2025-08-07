// src/app/api/upload-signed-url/route.ts (New File)
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // Assuming AWS S3
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // For generating pre-signed URLs
import { NextRequest, NextResponse } from 'next/server';

// Configure your S3 client (use environment variables)
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const { fileName, fileType } = await request.json(); // e.g., { fileName: "image.jpg", fileType: "image/jpeg" }

  if (!fileName || !fileType) {
    return NextResponse.json({ success: false, message: "Missing fileName or fileType" }, { status: 400 });
  }

  // Generate a unique key for the S3 object (e.g., using user ID, timestamp, original file name)
  const uniqueFileName = `${session.user._id}/${Date.now()}-${fileName}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueFileName,
    ContentType: fileType,
    ACL: 'public-read', // Or private, depending on access strategy
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600, // URL expires in 1 hour
    });
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${uniqueFileName}`; // Construct public URL

    return NextResponse.json({ success: true, signedUrl, publicUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ success: false, message: "Failed to generate upload URL." }, { status: 500 });
  }
}