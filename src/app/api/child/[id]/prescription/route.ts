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
		// 해당 childId에 연결된 모든 처방전 조회
		const prescriptions = await prisma.prescription.findMany({
			where: {
				childId: childId,
			},
			orderBy: {
				date: 'desc', // 날짜 최신순으로 정렬
			},
		});

		return NextResponse.json(prescriptions);
	} catch (error) {
		console.error('Error fetching prescriptions:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch prescriptions' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
