import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// POST - 리포트 생성 API
export async function POST(request: Request) {
	try {
		// JWT 토큰에서 사용자 정보 가져오기
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

		// 요청 본문 파싱
		const { imageUrl, childId } = await request.json();

		if (!imageUrl) {
			return NextResponse.json(
				{ message: '이미지 URL이 필요합니다.' },
				{ status: 400 }
			);
		}

		// 사용자 정보 가져오기
		const user = await prisma.user.findFirst({
			where: {
				userId: decoded.userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 해당 아이가 현재 사용자의 자녀인지 확인
		const child = await prisma.child.findFirst({
			where: {
				id: childId,
				userId: user.id,
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: '자녀 정보를 찾을 수 없거나 접근 권한이 없습니다.' },
				{ status: 404 }
			);
		}

		// 리포트 생성
		const report = await prisma.report.create({
			data: {
				childId: childId,
				imageUrl,
			},
		});

		// 응답 반환
		return NextResponse.json({
			message: '리포트가 성공적으로 생성되었습니다.',
			data: report,
		});
	} catch (error) {
		console.error('리포트 생성 오류:', error);
		return NextResponse.json(
			{ message: '리포트 생성 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

// GET - 리포트 목록 조회 API
export async function GET(request: Request) {
	try {
		// JWT 토큰에서 사용자 정보 가져오기
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

		// 사용자 정보 가져오기
		const user = await prisma.user.findFirst({
			where: {
				userId: decoded.userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 사용자의 모든 자녀 정보 가져오기
		const children = await prisma.child.findMany({
			where: {
				userId: user.id,
			},
			select: {
				id: true,
			},
		});

		const childIds = children.map((child) => child.id);

		// 모든 자녀의 리포트 조회 (각 리포트에 해당 아이의 이름 포함)
		const reports = await prisma.report.findMany({
			where: {
				childId: {
					in: childIds,
				},
			},
			orderBy: {
				createdAt: 'desc', // 최신순 정렬
			},
			include: {
				child: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		// 응답 데이터를 보기 좋게 가공 (선택 사항)
		const formattedReports = reports.map((report) => ({
			id: report.id,
			childId: report.childId,
			childName: report.child.name,
			date: report.createdAt,
		}));

		return NextResponse.json({
			message: '리포트 목록을 성공적으로 가져왔습니다.',
			data: formattedReports,
		});
	} catch (error) {
		console.error('리포트 조회 오류:', error);
		return NextResponse.json(
			{ message: '리포트 정보를 가져오는 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
