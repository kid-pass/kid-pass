import { PrismaClient } from "@prisma/client";
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken";
import { VACCINE_LIST, getVaccineTotalCount } from '@/utils/vaccine';

const prisma = new PrismaClient();

export interface NextVaccineInfo {
	diseaseName: string;
	vaccineName: string;
	vaccineCode: string;
	vaccineId: number;
	doseNumber: number;           // 백신 스케줄상의 차수
	scheduledDate: string;
	dayOffset: number;
	completedDoses: number;       // 현재까지 완료된 접종 횟수
	totalDoses: number;          // 해당 백신의 총 접종 횟수
	nextDoseNumber: number;      // 다음에 맞을 차수 (순서상)
	daysRemaining: number;       // D-day (며칠 남았는지)
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const birthDateStr = url.searchParams.get('birthDate');
		const childId = url.searchParams.get('childId');

		if (!birthDateStr) {
			return NextResponse.json(
				{ message: '아이의 생년월일이 필요합니다.' },
				{ status: 400 }
			);
		}

		if (!childId) {
			return NextResponse.json(
				{ message: '아이 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

		// JWT 토큰에서 사용자 정보 가져오기
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

		// 아이 정보 확인 및 접종 이력 조회 (완료된 접종 횟수 계산용)
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

		// 생년월일 Date 객체로 변환
		const birthDate = new Date(birthDateStr);
		const today = new Date();

		// 출생일부터 오늘까지의 일수 계산
		const daysSinceBirth = Math.floor(
			(today.getTime() - birthDate.getTime()) / (24 * 60 * 60 * 1000)
		);

		// 다음 접종 백신 정보를 저장할 배열
		const nextVaccines: NextVaccineInfo[] = [];

		// 모든 백신 정보를 순회하며 다음 접종일 계산
		for (const diseaseGroup of VACCINE_LIST) {
			// 해당 백신의 완료된 접종 횟수 계산
			const completedVaccineRecords = child.vacntnInfo.filter(
				(record) => record.vacntnId === diseaseGroup.id.toString()
			);
			const completedDoses = completedVaccineRecords.length;
			const totalDoses = getVaccineTotalCount(diseaseGroup.id);

			// 모든 백신 종류와 접종 차수를 순회
			let globalDoseIndex = 0;

			for (const vaccine of diseaseGroup.vaccines) {
				for (const dose of vaccine.doses) {
					globalDoseIndex++;

					// 현재 날짜 이후의 접종만 "다음 접종"으로 간주
					if (dose.dayOffset > daysSinceBirth) {
						// 접종일 계산
						const birthTime = birthDate.getTime();
						const offsetTime = dose.dayOffset * 24 * 60 * 60 * 1000;
						const vaccinationDate = new Date(birthTime + offsetTime);

						// ISO 형식으로 변환 (YYYY-MM-DD)
						const formattedDate = vaccinationDate
							.toISOString()
							.split('T')[0];

						// D-day 계산 (며칠 남았는지)
						const daysRemaining = dose.dayOffset - daysSinceBirth;

						nextVaccines.push({
							diseaseName: diseaseGroup.name,
							vaccineName: vaccine.name,
							vaccineCode: vaccine.code,
							vaccineId: diseaseGroup.id,
							doseNumber: dose.doseNumber,
							scheduledDate: formattedDate,
							dayOffset: dose.dayOffset,
							completedDoses: completedDoses,
							totalDoses: totalDoses,
							nextDoseNumber: globalDoseIndex,
							daysRemaining: daysRemaining,
						});
					}
				}
			}
		}

		// dayOffset 기준으로 정렬 (가장 빠른 접종부터)
		nextVaccines.sort((a, b) => a.dayOffset - b.dayOffset);

		// 가장 가까운 접종일의 백신들만 필터링
		if (nextVaccines.length > 0) {
			const earliestDayOffset = nextVaccines[0].dayOffset;
			const nextUpcomingVaccines = nextVaccines.filter(
				(vaccine) => vaccine.dayOffset === earliestDayOffset
			);

			return NextResponse.json({
				message: '다음 접종 예정 백신 정보를 조회했습니다.',
				nextDate: nextUpcomingVaccines[0].scheduledDate,
				data: nextUpcomingVaccines,
				childId: childId,
			});
		}

		return NextResponse.json({
			message: '남은 예방접종이 없습니다.',
			data: [],
		});
	} catch (error) {
		console.error('다음 백신 접종 정보 조회 에러:', error);
		return NextResponse.json(
			{ message: '다음 백신 접종 정보 조회 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}