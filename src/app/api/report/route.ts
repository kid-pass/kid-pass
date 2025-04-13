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
		const { imageUrl, title } = await request.json();

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

		// 리포트 생성
		const report = await prisma.report.create({
			data: {
				userId: user.id,
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

		// URL에서 reportId 파라미터 가져오기
		const { searchParams } = new URL(request.url);
		const reportId = searchParams.get('reportId');

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

		// 특정 리포트 ID가 제공된 경우 단일 리포트 조회
		if (reportId) {
			const report = await prisma.report.findFirst({
				where: {
					id: reportId,
					userId: user.id, // 보안을 위해 현재 인증된 사용자의 리포트인지 확인
				},
			});

			if (!report) {
				return NextResponse.json(
					{ message: '리포트를 찾을 수 없습니다.' },
					{ status: 404 }
				);
			}

			return NextResponse.json({
				message: '리포트 정보를 성공적으로 가져왔습니다.',
				data: report,
			});
		}

		// 리포트 ID가 없으면 사용자의 모든 리포트 조회
		const reports = await prisma.report.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				createdAt: 'desc', // 최신순 정렬
			},
		});

		return NextResponse.json({
			message: '리포트 목록을 성공적으로 가져왔습니다.',
			data: reports,
		});
	} catch (error) {
		console.error('리포트 조회 오류:', error);
		return NextResponse.json(
			{ message: '리포트 정보를 가져오는 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
