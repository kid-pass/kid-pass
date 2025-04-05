import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 특정 처방전 상세 정보 조회 API
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// JWT 토큰 검증
		const authHeader = request.headers.get('authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: '인증이 필요합니다.' },
				{ status: 401 }
			);
		}

		const token = authHeader.split(' ')[1];

		// 처방전 ID 추출
		const prescriptionId = params.id;

		if (!prescriptionId) {
			return NextResponse.json(
				{ message: '처방전 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

		// 처방전 조회
		const prescription = await prisma.prescription.findUnique({
			where: {
				id: prescriptionId,
			},
			include: {
				child: {
					select: {
						userId: true,
						name: true,
					},
				},
			},
		});

		if (!prescription) {
			return NextResponse.json(
				{ message: '처방전을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 응답에서 child 정보 제외
		const { child, ...prescriptionData } = prescription;

		return NextResponse.json(prescriptionData);
	} catch (error) {
		console.error('처방전 상세 조회 오류:', error);
		return NextResponse.json(
			{ message: '처방전 조회 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

// 처방전 수정 API
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
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

		// 처방전 ID 추출
		const prescriptionId = params.id;
		if (!prescriptionId) {
			return NextResponse.json(
				{ message: '처방전 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

		// 요청 본문 파싱
		const updateData = await request.json();
		const {
			date,
			hospital,
			doctor,
			diagnoses,
			treatmentMethod,
			medicines,
			prescriptionImageUrl,
			memo,
		} = updateData;

		// 필수 필드 검증
		if (!date || !hospital) {
			return NextResponse.json(
				{ message: '필수 정보가 누락되었습니다.' },
				{ status: 400 }
			);
		}

		// 처방전 조회 및 권한 확인
		const existingPrescription = await prisma.prescription.findUnique({
			where: {
				id: prescriptionId,
			},
			include: {
				child: {
					select: {
						userId: true,
					},
				},
			},
		});

		if (!existingPrescription) {
			return NextResponse.json(
				{ message: '처방전을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		if (existingPrescription.child.userId !== decoded.userId) {
			return NextResponse.json(
				{ message: '권한이 없습니다.' },
				{ status: 403 }
			);
		}

		// 처방전 업데이트
		const updatedPrescription = await prisma.prescription.update({
			where: {
				id: prescriptionId,
			},
			data: {
				date: new Date(date),
				hospital,
				doctor,
				diagnoses,
				treatmentMethod,
				medicines,
				prescriptionImageUrl,
				memo,
			},
		});

		return NextResponse.json({
			message: '처방전이 수정되었습니다.',
			data: updatedPrescription,
		});
	} catch (error) {
		console.error('처방전 수정 오류:', error);
		return NextResponse.json(
			{ message: '처방전 수정 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

// 처방전 삭제 API
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
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

		// 처방전 ID 추출
		const prescriptionId = params.id;
		if (!prescriptionId) {
			return NextResponse.json(
				{ message: '처방전 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

		// 처방전 조회 및 권한 확인
		const existingPrescription = await prisma.prescription.findUnique({
			where: {
				id: prescriptionId,
			},
			include: {
				child: {
					select: {
						userId: true,
					},
				},
			},
		});

		if (!existingPrescription) {
			return NextResponse.json(
				{ message: '처방전을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		if (existingPrescription.child.userId !== decoded.userId) {
			return NextResponse.json(
				{ message: '권한이 없습니다.' },
				{ status: 403 }
			);
		}

		// 처방전 삭제
		await prisma.prescription.delete({
			where: {
				id: prescriptionId,
			},
		});

		return NextResponse.json({
			message: '처방전이 삭제되었습니다.',
		});
	} catch (error) {
		console.error('처방전 삭제 오류:', error);
		return NextResponse.json(
			{ message: '처방전 삭제 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
