import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(req: NextRequest, { params }: Props) {
	try {
		const authHeader = req.headers.get('authorization');
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

		// report id 가져오기
		const { id } = await params;

		// 해당 report 찾기 (자녀 정보 포함)
		const report = await prisma.report.findFirst({
			where: {
				id,
			},
			select: {
				id: true,
				imageUrl: true,
			},
		});

		if (!report) {
			return NextResponse.json(
				{ message: '리포트를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: '리포트 상세 조회 성공',
			data: {
				imageUrl: report.imageUrl,
			},
		});
	} catch (error) {
		console.error('리포트 상세 조회 오류:', error);
		return NextResponse.json(
			{ message: '리포트 정보를 가져오는 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
