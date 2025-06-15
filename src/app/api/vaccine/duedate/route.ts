import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken";
import { VACCINE_LIST } from '@/utils/vaccine';

const prisma = new PrismaClient();

export interface OverdueVaccineInfo {
	vaccineName: string;        // 백신 이름
	doseNumber: number;         // 몇 차 접종인지
	daysOverdue: number;        // 며칠 지났는지
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const birthDateStr = url.searchParams.get('birthDate');
		const childId = url.searchParams.get('childId');

		if (!birthDateStr || !childId) {
			return NextResponse.json(
				{ message: '아이의 생년월일과 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

		// JWT 토큰 검증
		const authHeader = request.headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ message: "인증이 필요합니다." },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};

		// 사용자 찾기
		const user = await prisma.user.findUnique({
			where: { userId: decoded.userId },
		});

		if (!user) {
			return NextResponse.json(
				{ message: "사용자를 찾을 수 없습니다." },
				{ status: 404 }
			);
		}

		// 아이 정보 및 접종 이력 조회
		const child = await prisma.child.findUnique({
			where: {
				id: childId,
				userId: user.id,
			},
			include: {
				vacntnInfo: {
					where: {
						isCompleted: true,
					},
				},
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: "아이 정보를 찾을 수 없거나 접근 권한이 없습니다." },
				{ status: 404 }
			);
		}

		// 생년월일과 오늘 날짜로 경과 일수 계산
		const birthDate = new Date(birthDateStr);
		const today = new Date();
		const daysSinceBirth = Math.floor(
			(today.getTime() - birthDate.getTime()) / (24 * 60 * 60 * 1000)
		);

		const overdueVaccines: OverdueVaccineInfo[] = [];

		// 모든 백신 정보 순회
		for (const diseaseGroup of VACCINE_LIST) {
			// 해당 백신의 완료된 접종 기록들
			const completedVaccineRecords = child.vacntnInfo.filter(
				(record) => record.vacntnId === diseaseGroup.id.toString()
			);

			// 각 백신 종류와 차수 확인
			for (const vaccine of diseaseGroup.vaccines) {
				for (const dose of vaccine.doses) {
					// 접종 예정일이 이미 지났는지 확인
					if (dose.dayOffset < daysSinceBirth) {
						// 해당 차수를 실제로 맞았는지 확인
						const isCompleted = completedVaccineRecords.some(
							(record) =>
								record.vacntnDoseNumber === dose.doseNumber &&
								record.vacntnIctsd === vaccine.code
						);

						// 안 맞았으면 놓친 접종으로 추가
						if (!isCompleted) {
							const daysOverdue = daysSinceBirth - dose.dayOffset;

							overdueVaccines.push({
								vaccineName: vaccine.name,
								doseNumber: dose.doseNumber,
								daysOverdue: daysOverdue,
							});
						}
					}
				}
			}
		}

		// 지난 일수 순으로 정렬 (가장 많이 지난 것부터)
		overdueVaccines.sort((a, b) => b.daysOverdue - a.daysOverdue);

		return NextResponse.json({
			message: overdueVaccines.length > 0
				? '놓친 예방접종이 있습니다.'
				: '놓친 예방접종이 없습니다.',
			data: overdueVaccines,
			childId: childId,
		});

	} catch (error) {
		console.error('놓친 백신 접종 정보 조회 에러:', error);
		return NextResponse.json(
			{ message: '놓친 백신 접종 정보 조회 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}