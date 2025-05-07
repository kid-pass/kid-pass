// /api/prescription/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { del } from '@vercel/blob';

const prisma = new PrismaClient();

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(request: NextRequest, { params }: Props) {
	try {
		const { id } = await params; // params.id로 변경

		// JWT 토큰 검증
		const authHeader = request.headers.get('authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: '인증이 필요합니다.' },
				{ status: 401 }
			);
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};

		// 처방전 조회 - findUnique 메서드 수정
		const prescription = await prisma.prescription.findUnique({
			where: {
				id: id,
			},
		});

		if (!prescription) {
			return NextResponse.json(
				{ message: '해당 처방전을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 사용자 권한 확인 (해당 아이의 처방전인지)
		const child = await prisma.child.findFirst({
			where: {
				id: prescription.childId,
				user: {
					userId: decoded.userId,
				},
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: '접근 권한이 없습니다.' },
				{ status: 403 }
			);
		}

		return NextResponse.json({
			message: '처방전 상세 정보를 조회했습니다.',
			data: prescription,
		});
	} catch (error) {
		console.error('처방전 상세 조회 오류:', error);
		return NextResponse.json(
			{ message: '처방전 상세 조회 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
export async function DELETE(request: NextRequest, { params }: Props) {
	try {
		const { id } = await params; // params.id로 변경
		// JWT 토큰 검증
		const authHeader = request.headers.get('authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: '인증이 필요합니다.' },
				{ status: 401 }
			);
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};

		const prescriptionId = id;

		// 처방전 정보 조회
		const prescription = await prisma.prescription.findUnique({
			where: { id: prescriptionId },
			include: { child: { include: { user: true } } },
		});

		// 처방전이 존재하지 않는 경우
		if (!prescription) {
			return NextResponse.json(
				{ message: '처방전을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 권한 확인: 해당 처방전이 현재 로그인한 사용자의 아이에게 속하는지 확인
		if (prescription.child.user.userId !== decoded.userId) {
			return NextResponse.json(
				{ message: '이 처방전을 삭제할 권한이 없습니다.' },
				{ status: 403 }
			);
		}

		// 이미지 URL이 있는 경우 Vercel Blob에서 이미지 삭제
		if (prescription.prescriptionImageUrl) {
			try {
				// URL에서 파일 경로 추출
				const imageUrl = prescription.prescriptionImageUrl;
				await del(imageUrl);
			} catch (imageError) {
				console.error('이미지 삭제 오류:', imageError);
				// 이미지 삭제 실패해도 계속 진행 (데이터베이스 레코드는 삭제)
			}
		}

		// Prisma를 사용하여 처방전 레코드 삭제
		await prisma.prescription.delete({
			where: { id: prescriptionId },
		});

		return NextResponse.json(
			{ message: '처방전이 성공적으로 삭제되었습니다.' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('처방전 삭제 오류:', error);
		return NextResponse.json(
			{ message: '처방전 삭제 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
