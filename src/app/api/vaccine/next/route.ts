import { NextResponse } from 'next/server';
import { VACCINE_LIST } from '@/utils/vaccine';

type NextVaccineInfo = {
  diseaseName: string;
  vaccineName: string;
  vaccineCode: string;
  doseNumber: number;
  scheduledDate: string;
  dayOffset: number;
};

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

    // 생년월일 Date 객체로 변환
    const birthDate = new Date(birthDateStr);
    
    // 오늘 날짜
    const today = new Date();

    // 출생일부터 오늘까지의 일수 계산
    const daysSinceBirth = Math.floor(
      (today.getTime() - birthDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    // 다음 접종 백신 정보를 저장할 배열
    const nextVaccines: NextVaccineInfo[] = [];

    // 모든 백신 정보를 순회하며 다음 접종일 계산
    for (const diseaseGroup of VACCINE_LIST) {
      for (const vaccine of diseaseGroup.vaccines) {
        for (const dose of vaccine.doses) {
          // 아직 접종 날짜가 도래하지 않은 경우만 고려 (현재 날짜 이후)
          if (dose.dayOffset > daysSinceBirth) {
            // 접종일 계산
            const birthTime = birthDate.getTime();
            const offsetTime = dose.dayOffset * 24 * 60 * 60 * 1000;
            const vaccinationDate = new Date(birthTime + offsetTime);
            
            // ISO 형식으로 변환 (YYYY-MM-DD)
            const formattedDate = vaccinationDate.toISOString().split('T')[0];

            nextVaccines.push({
              diseaseName: diseaseGroup.name,
              vaccineName: vaccine.name,
              vaccineCode: vaccine.code,
              doseNumber: dose.doseNumber,
              scheduledDate: formattedDate,
              dayOffset: dose.dayOffset
            });
          }
        }
      }
    }

    // 날짜순으로 정렬
    nextVaccines.sort((a, b) => {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });

    // 가장 가까운 날짜의 백신만 필터링
    if (nextVaccines.length > 0) {
      const earliestDate = nextVaccines[0].scheduledDate;
      const nextUpcomingVaccines = nextVaccines.filter(
        vaccine => vaccine.scheduledDate === earliestDate
      );

      return NextResponse.json({
        message: '다음 접종 예정 백신 정보를 조회했습니다.',
        nextDate: earliestDate,
        data: nextUpcomingVaccines,
        childId: childId
      });
    }

    return NextResponse.json({
      message: '남은 예방접종이 없습니다.',
      data: []
    });

  } catch (error) {
    console.error('다음 백신 접종 정보 조회 에러:', error);
    return NextResponse.json(
      { message: '다음 백신 접종 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}