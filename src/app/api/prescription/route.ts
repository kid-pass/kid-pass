import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
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

		// 요청 본문 파싱
		const {
			childId,
			date,
			hospital,
			doctor,
			diagnoses,
			treatmentMethod,
			medicines,
			prescriptionImageUrl,
			memo,
		} = await request.json();

		// 필수 필드 검증
		if (!childId || !date || !hospital) {
			return NextResponse.json(
				{ message: '필수 정보가 누락되었습니다.' },
				{ status: 400 }
			);
		}

		// 사용자 확인 및 아이와의 관계 확인
		const child = await prisma.child.findFirst({
			where: {
				id: childId,
				user: {
					userId: decoded.userId,
				},
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: '해당 아이를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 진료 기록 생성
		const prescription = await prisma.prescription.create({
			data: {
				childId,
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

		return NextResponse.json(
			{
				message: '진료 기록이 등록되었습니다.',
				data: prescription,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('진료 기록 등록 오류:', error);
		return NextResponse.json(
			{ message: '진료 기록 등록 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
