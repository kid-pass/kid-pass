// /app/api/vaccine/schedule/months/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

interface VaccineSchedule {
  vacntnInoclDt: string | null;
}

interface MonthWithVaccine {
  year: number;
  month: number;
}

interface MonthsAccumulator {
  [key: string]: MonthWithVaccine;
}

// 특정 아이의 백신 일정이 있는 월 목록을 조회하는 API
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId');

    if (!childId) {
      return NextResponse.json(
        { message: '아이 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 아이의 모든 백신 일정 조회
    const vaccineSchedules = await prisma.vacntnInfo.findMany({
      where: { childId },
      select: {
        vacntnInoclDt: true, // 접종일자만 선택
      },
    });

    // 연도와 월 추출 및 중복 제거
    const monthsWithVaccines = vaccineSchedules.reduce<MonthsAccumulator>((acc, schedule) => {
      if (!schedule.vacntnInoclDt) return acc;
      
      const dateParts = schedule.vacntnInoclDt.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      
      // 중복 체크를 위한 키 생성
      const key = `${year}-${month}`;
      
      if (!acc[key]) {
        acc[key] = { year, month };
      }
      
      return acc;
    }, {});

    // 객체를 배열로 변환
    const result = Object.values(monthsWithVaccines);
    
    // 연도와 월로 정렬
    result.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return NextResponse.json({
      message: '백신 일정이 있는 월 목록을 조회했습니다.',
      data: result,
    });
  } catch (error) {
    console.error('백신 일정 월 목록 조회 에러:', error);
    return NextResponse.json(
      { message: '백신 일정 월 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}