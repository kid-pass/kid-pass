// src/types/index.ts
// 증상 타입 정의
export interface SymptomItem {
	id: string;
	symptom: string;
}

// 기록 타입 정의
export interface SymptomRecord {
	id: string;
	type: string;
	startTime: string;
	endTime: string | null;
	symptom: string;
	severity: string;
	memo: string | null;
}

export interface CategoryItem {
	id: string;
	behavior: string[];
}

// 날짜별 그룹화된 기록 인터페이스
export interface GroupedRecords {
	[date: string]: SymptomRecord[];
}

// 아이 정보에 대한 인터페이스 정의
export interface ChildProfile {
	id: string;
	name: string;
	birthDate: string;
	gender: 'M' | 'F';
	weight: number;
	height: number;
	headCircumference: number;
	ageType: string;
	allergies: string[];
	symptoms: string[];
	memo: string;
	createdAt: string;
	updatedAt: string;
	age?: number;
	formattedBirthDate?: string;
}

// API 응답 인터페이스
export interface GetChldrnInfo {
	message: string;
	data: ChildProfile;
}

// 백신 접종 타입 정의
export interface VaccinationRecord {
	id: string;
	vaccinationDate: string;
	vaccineName: string;
	totalRequiredDoses: number;
	completedDoses: number;
}

// 처방전 타입 정의 (이미 정의되어 있다고 가정)
export interface Prescription {
	id: string;
	childId: string;
	date: string;
	hospital: string;
	doctor?: string;
	diagnoses?: string;
	medicines?: string;
	prescriptionImageUrl?: string;
	onClick: () => void;
	// 기타 필요한 필드
}
