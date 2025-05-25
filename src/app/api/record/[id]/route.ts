import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(request: NextRequest, { params }: Props) {
	try {
		const { id } = await params;

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

		// URL에서 쿼리 파라미터 추출
		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type');

		if (!type) {
			return NextResponse.json(
				{ message: 'type 파라미터가 필요합니다.' },
				{ status: 400 }
			);
		}

		// 기록 조회
		const record = await prisma.record.findFirst({
			where: {
				id,
				type,
				child: {
					user: {
						userId: decoded.userId,
					},
				},
			},
		});

		if (!record) {
			return NextResponse.json(
				{ message: '해당 기록을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: '기록을 조회했습니다.',
			data: record,
		});
	} catch (error) {
		console.error('기록 조회 에러:', error);
		return NextResponse.json(
			{ message: '기록 조회 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest, { params }: Props) {
	try {
		const { id } = await params;

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

		// 기록 삭제
		await prisma.record.delete({
			where: {
				id,
				child: {
					user: {
						userId: decoded.userId,
					},
				},
			},
		});

		return NextResponse.json({
			message: '기록이 삭제되었습니다.',
		});
	} catch (error) {
		console.error('기록 삭제 에러:', error);
		return NextResponse.json(
			{ message: '기록 삭제 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
export async function PUT(request: NextRequest, { params }: Props) {
	try {
		const { id } = await params;

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

		const body = await request.json();
		console.log(body);

		// 먼저 기록을 찾아서 childId 확인
		const existingRecord = await prisma.record.findUnique({
			where: {
				id,
				child: {
					user: {
						userId: decoded.userId,
					},
				},
			},
			select: {
				childId: true,
			},
		});

		if (!existingRecord) {
			return NextResponse.json(
				{ message: '해당 기록을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 트랜잭션을 사용하여 원자적 작업 보장
		const result = await prisma.$transaction(async (tx) => {
			// 1. 기록 업데이트
			const record = await tx.record.update({
				where: {
					id,
				},
				data: {
					startTime: new Date(body.startTime),
					endTime: body.endTime ? new Date(body.endTime) : null,
					type: body.type,
					mealType: body.mealType,
					amount: body.amount ? parseFloat(body.amount) : null,
					unit: body.unit,
					memo: body.memo,
					// 성장 관련 필드 추가
					weight: body.weight ? parseFloat(body.weight) : null,
					height: body.height ? parseFloat(body.height) : null,
					headSize: body.headSize ? parseFloat(body.headSize) : null,
					// 기타 필드들
					category: body.category,
					behavior: Array.isArray(body.behavior)
						? body.behavior
						: body.behavior
						? [body.behavior]
						: [],
					// 필요한 다른 필드들도 여기에 추가
				},
			});

			// 2. 성장 관련 데이터가 있으면 Child 모델도 업데이트
			if (
				body.weight !== undefined ||
				body.height !== undefined ||
				body.headSize !== undefined
			) {
				// 업데이트할 데이터 객체 생성
				const childUpdateData: any = {};

				if (body.weight !== undefined) {
					childUpdateData.weight = body.weight
						? parseFloat(body.weight)
						: null;
				}

				if (body.height !== undefined) {
					childUpdateData.height = body.height
						? parseFloat(body.height)
						: null;
				}

				if (body.headSize !== undefined) {
					// Child 모델에서는 headCircumference 필드명 사용
					childUpdateData.headCircumference = body.headSize
						? parseFloat(body.headSize)
						: null;
				}

				// Child 모델 업데이트
				if (Object.keys(childUpdateData).length > 0) {
					await tx.child.update({
						where: { id: existingRecord.childId },
						data: childUpdateData,
					});
				}
			}

			return record;
		});

		return NextResponse.json({
			message: '기록이 수정되었습니다.',
			data: result,
		});
	} catch (error) {
		console.error('기록 수정 에러:', error);
		return NextResponse.json(
			{ message: '기록 수정 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
