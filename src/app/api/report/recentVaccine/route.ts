import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { VACCINE_LIST, getTotalRequiredVaccinations } from '@/utils/vaccine';

const prisma = new PrismaClient();

// 아이의 백신 접종 정보 조회
export async function GET(request: Request) {
	try {
		// URL에서 아이 ID 추출 및 추가 파라미터 가져오기
		const url = new URL(request.url);
		const chldrnNo = url.searchParams.get('chldrnNo');

		// 최근 접종 조회 일수 (기본값 30일)
		const recentDays = parseInt(url.searchParams.get('recentDays') || '30');

		// 최근 접종 최대 개수 (기본값 3)
		const recentCount = parseInt(
			url.searchParams.get('recentCount') || '3'
		);

		if (!chldrnNo) {
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

		// 사용자 찾기
		const user = await prisma.user.findUnique({
			where: { userId: decoded.userId },
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 아이 정보 확인 및 본인의 아이인지 검증
		const child = await prisma.child.findUnique({
			where: {
				id: chldrnNo,
				userId: user.id,
			},
			include: {
				vacntnInfo: {
					orderBy: {
						createdAt: 'desc', // 최신 순으로 정렬
					},
				},
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: '아이 정보를 찾을 수 없거나 접근 권한이 없습니다.' },
				{ status: 404 }
			);
		}

		// 전체 필요한 접종 횟수 계산
		const totalRequiredDoses = getTotalRequiredVaccinations();

		// 완료된 접종 횟수
		const completedDoses = child.vacntnInfo.filter(
			(record) => record.isCompleted === true
		).length;

		// 완료율 계산 (반올림하여 백분율로)
		const completionPercentage = Math.round(
			(completedDoses / totalRequiredDoses) * 100
		);

		// 최근 기간 내의 접종 기록 필터링
		const today = new Date();
		const pastDate = new Date();
		pastDate.setDate(today.getDate() - recentDays);

		// 최근 접종 기록 필터링 (완료된 접종만)
		const recentVaccinationIds = child.vacntnInfo
			.filter(
				(record) =>
					record.isCompleted === true &&
					new Date(record.createdAt) >= pastDate
			)
			.slice(0, recentCount) // 최대 개수 제한
			.map((record) => ({
				id: record.id,
				vacntnId: record.vacntnId,
				createdAt: record.createdAt,
			}));

		// 최근 접종 기록에 대한 상세 정보 구성
		const recentVaccinations = recentVaccinationIds
			.map((record) => {
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
					vaccinationDate: record.createdAt,
					vaccineName: vaccine.name,
					totalRequiredDoses: totalDoses,
					completedDoses: completedDoses,
				};
			})
			.filter(Boolean); // null 값 제거

		return NextResponse.json({
			message: '백신 접종 정보를 조회했습니다.',
			data: recentVaccinations,
		});
	} catch (error) {
		console.error('백신 접종 정보 조회 에러:', error);
		return NextResponse.json(
			{ message: '백신 접종 정보 조회 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

// 기본 호출(최근 1년간 최대 3개):
// GET /api/vaccines?chldrnNo=123

// 최근 30일간 최대 5개 조회:
// GET /api/vaccines?chldrnNo=123&recentDays=30&recentCount=5

// 최근 2년간의 모든 접종 기록 조회:
// GET /api/vaccines?chldrnNo=123&recentDays=730&recentCount=100
