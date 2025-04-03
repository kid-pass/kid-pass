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

		// 기록 수정
		const record = await prisma.record.update({
			where: {
				id,
				child: {
					user: {
						userId: decoded.userId,
					},
				},
			},
			data: {
				startTime: new Date(body.startTime),
				endTime: body.endTime ? new Date(body.endTime) : null,
				type: body.type,
				mealType: body.mealType,
				amount: body.amount,
				unit: body.unit,
				memo: body.memo,
				category: body.category,
				behavior: body.behavior ? [body.behavior] : [],
			},
		});

		return NextResponse.json({
			message: '기록이 수정되었습니다.',
			data: record,
		});
	} catch (error) {
		console.error('기록 수정 에러:', error);
		return NextResponse.json(
			{ message: '기록 수정 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
