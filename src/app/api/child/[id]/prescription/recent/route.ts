// /child/[id]/prescription/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(request: NextRequest, { params }: Props) {
	try {
		const { id } = await params;
		const childId = id;

		// 3일 전 날짜 계산
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		// 해당 childId에 연결된 최근 3일 내의 처방전 조회
		const prescriptions = await prisma.prescription.findMany({
			where: {
				childId: childId,
				date: {
					gte: threeDaysAgo,
				},
			},
			orderBy: {
				date: 'desc', // 날짜 최신순으로 정렬
			},
		});

		return NextResponse.json(prescriptions);
	} catch (error) {
		console.error('Error fetching recent prescriptions:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch recent prescriptions' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
