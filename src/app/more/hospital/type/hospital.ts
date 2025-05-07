export interface hospitalRecord {
	mdexmnRcordDt: string; // 기록날짜
	hsptlNo: string;
	hsptlDrctr: string; // 의사 이름
	mdexmnMdlrt: string; // 치료방법
	mdexmnDgnssNm: string; // 진단 명
	mdexmnMemo: string; // 메모
	file: string;
	chldrnNo: string;
	drugNm: string; // 약 이름
	hospital: string; // 병원 이름
}

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
