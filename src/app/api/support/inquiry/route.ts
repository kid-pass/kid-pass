import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "인증 토큰이 필요합니다" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decodedResult = await verifyToken(token);

    if (!decodedResult) {
      return NextResponse.json(
        { message: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "모든 필드를 입력해주세요" },
        { status: 400 }
      );
    }

    // Generate inquiry ID
    const inquiryId = `INQ-${Date.now()}`;

    // Store the inquiry in the database
    try {
      // Prisma를 사용하여 데이터베이스에 저장
      await prisma.inquiry.create({
        data: {
          userId: decodedResult.userId,
          name,
          email,
          subject,
          message,
          inquiryId,
          status: "pending"
        }
      });

      return NextResponse.json(
        {
          message: "문의가 성공적으로 접수되었습니다",
          inquiryId,
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database error saving inquiry:", dbError);
      return NextResponse.json(
        { message: "문의 저장 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Support inquiry error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
