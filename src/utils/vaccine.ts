export interface DoseSchedule {
	doseNumber: number; // 접종 차수
	dayOffset: number; // 출생일 기준 권장 접종일 (일 단위)
}

export interface VaccineInfo {
	code: string; // 백신 코드
	name: string; // 백신 상세 이름
	doses: DoseSchedule[]; // 접종 스케줄 정보
}

export interface VaccineType {
	id: number; // 백신 ID
	name: string; // 백신 질병명
	vaccines: VaccineInfo[]; // 해당 질병에 사용되는 백신 목록
}

export const vaccineColorMap: Record<string, string> = {
	BCG: '#6b7ae3', // 결핵
	HepB: '#f0ad4e', // B형간염
	DTaP: '#5bc0de', // 디프테리아/파상풍/백일해
	Tdap: '#5bc0de', // 파상풍/디프테리아/백일해 추가접종
	IPV: '#5cb85c', // 폴리오
	Hib: '#d9534f', // b형 헤모필루스
	PCV: '#17a2b8', // 폐렴구균
	MMR: '#f06292', // 홍역/유행성이하선염/풍진
	VAR: '#ba68c8', // 수두
	HepA: '#ff7043', // A형간염
	IJEV: '#9575cd', // 일본뇌염 불활성화
	LJEV: '#7986cb', // 일본뇌염
};

export const VACCINE_LIST: VaccineType[] = [
	{
		id: 1,
		name: '결핵',
		vaccines: [
			{
				code: 'BCG',
				name: '결핵 백신(BCG)',
				doses: [{ doseNumber: 1, dayOffset: 28 }],
			},
		],
	},
	{
		id: 2,
		name: 'B형간염',
		vaccines: [
			{
				code: 'HepB',
				name: 'B형간염 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 0 },
					{ doseNumber: 2, dayOffset: 30 },
					{ doseNumber: 3, dayOffset: 180 },
				],
			},
		],
	},
	{
		id: 3,
		name: '디프테리아',
		vaccines: [
			{
				code: 'DTaP',
				name: '디프테리아/파상풍/백일해 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
					{ doseNumber: 3, dayOffset: 180 },
					{ doseNumber: 4, dayOffset: 540 },
					{ doseNumber: 5, dayOffset: 2190 },
				],
			},
			{
				code: 'Tdap',
				name: '파상풍/디프테리아/백일해 추가접종',
				doses: [{ doseNumber: 6, dayOffset: 4380 }],
			},
		],
	},
	{
		id: 4,
		name: '파상풍',
		vaccines: [
			{
				code: 'DTaP',
				name: '디프테리아/파상풍/백일해 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
					{ doseNumber: 3, dayOffset: 180 },
					{ doseNumber: 4, dayOffset: 540 },
					{ doseNumber: 5, dayOffset: 2190 },
				],
			},
			{
				code: 'Tdap',
				name: '파상풍/디프테리아/백일해 추가접종',
				doses: [{ doseNumber: 6, dayOffset: 4380 }],
			},
		],
	},
	{
		id: 5,
		name: '백일해',
		vaccines: [
			{
				code: 'DTaP',
				name: '디프테리아/파상풍/백일해 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
					{ doseNumber: 3, dayOffset: 180 },
					{ doseNumber: 4, dayOffset: 540 },
					{ doseNumber: 5, dayOffset: 2190 },
				],
			},
			{
				code: 'Tdap',
				name: '파상풍/디프테리아/백일해 추가접종',
				doses: [{ doseNumber: 6, dayOffset: 4380 }],
			},
		],
	},
	{
		id: 6,
		name: '폴리오',
		vaccines: [
			{
				code: 'IPV',
				name: '불활성화 폴리오 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
					{ doseNumber: 3, dayOffset: 540 },
					{ doseNumber: 4, dayOffset: 2190 },
				],
			},
		],
	},
	{
		id: 7,
		name: 'b형헤모필루스',
		vaccines: [
			{
				code: 'Hib',
				name: 'b형 헤모필루스 인플루엔자 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
					{ doseNumber: 3, dayOffset: 180 },
					{ doseNumber: 4, dayOffset: 450 },
				],
			},
		],
	},
	{
		id: 8,
		name: '페렴구균',
		vaccines: [
			{
				code: 'PCV',
				name: '폐렴구균 결합 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
					{ doseNumber: 3, dayOffset: 180 },
					{ doseNumber: 4, dayOffset: 450 },
				],
			},
		],
	},
	{
		id: 9,
		name: '홍역',
		vaccines: [
			{
				code: 'MMR',
				name: '홍역/유행성이하선염/풍진 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 540 },
					{ doseNumber: 2, dayOffset: 2190 },
				],
			},
		],
	},
	{
		id: 10,
		name: '유행성 이하선염',
		vaccines: [
			{
				code: 'MMR',
				name: '홍역/유행성이하선염/풍진 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 540 },
					{ doseNumber: 2, dayOffset: 2190 },
				],
			},
		],
	},
	{
		id: 11,
		name: '풍진',
		vaccines: [
			{
				code: 'MMR',
				name: '홍역/유행성이하선염/풍진 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 540 },
					{ doseNumber: 2, dayOffset: 2190 },
				],
			},
		],
	},
	{
		id: 12,
		name: '수두',
		vaccines: [
			{
				code: 'VAR',
				name: '수두 백신',
				doses: [{ doseNumber: 1, dayOffset: 450 }],
			},
		],
	},
	{
		id: 13,
		name: 'A형간염',
		vaccines: [
			{
				code: 'HepA',
				name: 'A형간염 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 1050 },
					{ doseNumber: 2, dayOffset: 1050 },
				],
			},
		],
	},
	{
		id: 14,
		name: '일본뇌염',
		vaccines: [
			{
				code: 'IJEV',
				name: '일본뇌염 불활성화 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 690 },
					{ doseNumber: 2, dayOffset: 690 },
					{ doseNumber: 3, dayOffset: 1050 },
					{ doseNumber: 4, dayOffset: 2190 },
					{ doseNumber: 5, dayOffset: 4380 },
				],
			},
			{
				code: 'LJEV',
				name: '일본뇌염 약독화 생백신',
				doses: [
					{ doseNumber: 1, dayOffset: 690 },
					{ doseNumber: 2, dayOffset: 1050 },
				],
			},
		],
	},
	{
		id: 15,
		name: '사람유두종바이러스',
		vaccines: [
			{
				code: 'HPV',
				name: '사람유두종바이러스 백신',
				doses: [
					{ doseNumber: 1, dayOffset: 4380 },
					{ doseNumber: 2, dayOffset: 4380 },
				],
			},
		],
	},
	{
		id: 16,
		name: '로티바이러스',
		vaccines: [
			{
				code: 'RV1',
				name: '로타바이러스 백신(1가)',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
				],
			},
			{
				code: 'RV5',
				name: '로타바이러스 백신(5가)',
				doses: [
					{ doseNumber: 1, dayOffset: 60 },
					{ doseNumber: 2, dayOffset: 120 },
					{ doseNumber: 3, dayOffset: 180 },
				],
			},
		],
	},
];

// 백신별 총 접종 횟수 계산 함수
export const getVaccineTotalCount = (vaccineId: number): number => {
	const vaccine = VACCINE_LIST.find((v) => v.id === vaccineId);
	if (!vaccine) return 0;

	// 모든 백신 타입과 각 접종 횟수를 합산
	return vaccine.vaccines.reduce((total, vaccineType) => {
		return total + vaccineType.doses.length;
	}, 0);
};

// 전체 필수 예방접종 횟수 계산을 위한 유틸리티 함수
export const getTotalRequiredVaccinations = (): number => {
	return VACCINE_LIST.reduce((sum, vaccine) => {
		return sum + getVaccineTotalCount(vaccine.id);
	}, 0);
};
