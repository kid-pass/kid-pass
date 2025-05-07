// /app/api/report/childReportData/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { VACCINE_LIST } from '@/utils/vaccine';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		// URL에서 chldrnNo 파라미터와 days 파라미터 가져오기
		const { searchParams } = new URL(request.url);
		const childId = searchParams.get('childId');
		const days = parseInt(searchParams.get('days') || '3'); // 기본 3일

		if (!childId) {
			return NextResponse.json(
				{ message: '아이 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

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

		// 사용자와 자녀 관계 확인
		const user = await prisma.user.findUnique({
			where: { userId: decoded.userId },
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 아이 정보 확인
		const child = await prisma.child.findFirst({
			where: {
				id: childId,
				userId: user.id,
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: '아이 정보를 찾을 수 없거나 접근 권한이 없습니다.' },
				{ status: 404 }
			);
		}

		// Promise.all을 사용하여 모든 데이터를 병렬로 가져오기
		const [
			profileData,
			symptomData,
			prescriptionData,
			vaccineData,
			etcData,
		] = await Promise.all([
			// 1. 아이 프로필 데이터
			getChildProfile(childId),

			// 2. 증상 데이터
			getSymptomRecords(childId, days),

			// 3. 처방전 데이터
			getPrescriptionRecords(childId, days),

			// 4. 백신 접종 정보
			getVaccineRecords(childId),

			// 5. ETC 데이터
			getETCRecords(childId, days),
		]);

		// 모든 데이터 반환
		return NextResponse.json({
			message: '아이 레포트 데이터를 성공적으로 가져왔습니다.',
			data: {
				profile: profileData,
				symptoms: symptomData,
				prescriptions: prescriptionData,
				vaccines: vaccineData,
				categories: etcData,
			},
		});
	} catch (error) {
		console.error('아이 레포트 데이터 조회 에러:', error);
		return NextResponse.json(
			{
				message:
					'아이 레포트 데이터를 가져오는 중 오류가 발생했습니다.',
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

// 아이 프로필 정보 가져오기
async function getChildProfile(childId: string) {
	const child = await prisma.child.findUnique({
		where: { id: childId },
		select: {
			id: true,
			name: true,
			birthDate: true,
			gender: true,
			weight: true,
			height: true,
			headCircumference: true,
			ageType: true,
			allergies: true,
			symptoms: true,
			memo: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return child;
}

// 증상 기록 가져오기
async function getSymptomRecords(childId: string, days: number) {
	// 시작 날짜 계산 (오늘 - days)
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);
	const startDateStr = startDate.toISOString().split('T')[0];

	// 증상 기록 쿼리
	const records = await prisma.record.findMany({
		where: {
			childId: childId,
			type: 'SYMPTOM',
			startTime: {
				gte: startDate,
			},
		},
		orderBy: {
			startTime: 'desc',
		},
	});

	// 1. 날짜별로 그룹화된 원본 데이터 유지
	const groupedRecords = records.reduce((acc, record) => {
		const dateKey = record.startTime.toISOString().split('T')[0];
		if (!acc[dateKey]) {
			acc[dateKey] = [];
		}
		acc[dateKey].push(record);
		return acc;
	}, {} as { [date: string]: any[] });

	// 2. 증상만 추출 및 중복 제거
	const symptomsWithIds: { id: string; symptom: string }[] = [];

	Object.keys(groupedRecords).forEach((date) => {
		groupedRecords[date].forEach((record) => {
			if (record.symptom && record.symptom !== null) {
				symptomsWithIds.push({
					id: record.id,
					symptom: record.symptom,
				});
			}
		});
	});

	// 3. 중복 제거 (동일 증상은 하나만 유지)
	const uniqueSymptoms = Array.from(
		new Map(symptomsWithIds.map((item) => [item.symptom, item])).values()
	);

	// 클라이언트 코드 기대에 맞게 반환
	return uniqueSymptoms;
}

// 처방전 기록 가져오기
async function getPrescriptionRecords(childId: string, days: number) {
	// 시작 날짜 계산 (오늘 - days)
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	// 처방전 기록 쿼리
	const prescriptions = await prisma.prescription.findMany({
		where: {
			childId: childId,
			date: {
				gte: startDate,
			},
		},
		orderBy: {
			date: 'desc',
		},
	});

	return prescriptions;
}

// 백신 접종 정보 가져오기
async function getVaccineRecords(childId: string) {
	try {
		// 최근 30일 이내 완료된 백신 접종 정보
		const recentDays = 30;
		const recentCount = 3;

		const today = new Date();
		const pastDate = new Date();
		pastDate.setDate(today.getDate() - recentDays);

		// 아이의 모든 백신 접종 정보 가져오기
		const child = await prisma.child.findUnique({
			where: { id: childId },
			include: {
				vacntnInfo: {
					orderBy: {
						updatedAt: 'desc', // 최신 업데이트 순으로 정렬
					},
				},
			},
		});

		if (!child) {
			return [];
		}

		// 최근 30일 이내 업데이트된 기록만 필터링하여 최대 3개 가져오기
		const vaccinationRecords = child.vacntnInfo
			.filter((record) => new Date(record.updatedAt) >= pastDate)
			.slice(0, recentCount)
			.map((record) => ({
				id: record.id,
				vacntnId: record.vacntnId,
				updatedAt: record.updatedAt,
			}));

		// 최근 접종 기록에 대한 상세 정보 구성
		const recentVaccinations = vaccinationRecords
			.map((record) => {
				try {
					// 해당 백신 찾기
					const vaccine = VACCINE_LIST.find(
						(v) => v.id.toString() === record.vacntnId
					);

					if (!vaccine) {
						return null;
					}

					// 해당 백신의 모든 접종 기록
					const vaccineRecords = child.vacntnInfo.filter(
						(r) => r.vacntnId === record.vacntnId
					);

					// 해당 백신의 총 접종 횟수 계산
					const totalDoses = vaccine.vaccines.reduce(
						(sum, v) => sum + v.doses.length,
						0
					);

					// 현재까지 완료된 접종 횟수
					const completedDoses = vaccineRecords.filter(
						(r) => r.isCompleted === true
					).length;

					return {
						id: record.id,
						vaccinationDate: record.updatedAt,
						vaccineName: vaccine.name,
						totalRequiredDoses: totalDoses,
						completedDoses: completedDoses,
					};
				} catch (error) {
					return null;
				}
			})
			.filter(Boolean); // null 값 제거

		return recentVaccinations;
	} catch (error) {
		console.error('백신 데이터 조회 오류:', error);
		return [];
	}
}
// ETC 기록 가져오기
async function getETCRecords(childId: string, days: number) {
	// 시작 날짜 계산 (오늘 - days)
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);
	const startDateStr = startDate.toISOString().split('T')[0];

	// ETC 기록 쿼리
	const records = await prisma.record.findMany({
		where: {
			childId: childId,
			type: 'ETC',
			startTime: {
				gte: startDate,
			},
		},
		orderBy: {
			startTime: 'desc',
		},
	});

	// 카테고리 추출 및 중복 제거
	const categorySet = new Set();
	const categoryWithIds: { id: string; behavior: string[] }[] = [];

	for (const record of records) {
		// behavior가 배열인지 확인하고 처리
		if (record.behavior && Array.isArray(record.behavior)) {
			// 이미 추가된 behavior인지 확인
			const behaviorKey = record.behavior.join(','); // 배열을 문자열로 변환하여 비교

			if (!categorySet.has(behaviorKey)) {
				categorySet.add(behaviorKey);

				categoryWithIds.push({
					id: record.id,
					behavior: record.behavior,
				});
			}
		}
	}

	return categoryWithIds;
}
