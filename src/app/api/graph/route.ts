import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { MealType } from "@/app/record/components/fields/FeedingFields";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
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

    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const type = searchParams.get("type");
    // const period = searchParams.get("period") || "month"; // 기존 코드

    // 수정: period가 숫자면 일(day) 단위로 처리
    const periodParam = searchParams.get("period") || "month";

    // 사용자 확인 및 아이와의 관계 확인
    const child = await prisma.child.findFirst({
      where: {
        id: childId!,
        user: {
          userId: decoded.userId,
        },
      },
    });

    if (!child) {
      return NextResponse.json(
        { message: "해당 아이를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 기간 설정
    let startDate: Date;
    if (!isNaN(Number(periodParam))) {
      // 숫자라면 일(day) 단위로 처리
      startDate = dayjs().subtract(Number(periodParam), "day").toDate();
    } else {
      switch (periodParam) {
        case "month":
          startDate = dayjs().subtract(1, "month").toDate();
          break;
        case "quarter":
          startDate = dayjs().subtract(3, "month").toDate();
          break;
        case "year":
          startDate = dayjs().subtract(1, "year").toDate();
          break;
        default:
          startDate = dayjs().subtract(1, "month").toDate();
      }
    }

    // 그래프 데이터 조회 로직
    const graphData = await getGraphData(childId!, type!, startDate);

    return NextResponse.json({
      message: "그래프 데이터를 조회했습니다.",
      data: graphData,
    });
  } catch (error) {
    console.error("그래프 데이터 조회 에러:", error);
    return NextResponse.json(
      { message: "그래프 데이터 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 그래프 데이터 추출 함수
async function getGraphData(childId: string, type: string, startDate: Date) {
  switch (type) {
    case "FEEDING":
      return await getFeedingGraphData(childId, startDate);
    case "SLEEP":
      return await getSleepGraphData(childId, startDate);
    case "TEMPERATURE":
      return await getTemperatureGraphData(childId, startDate);
    case "DIAPER":
      return await getDiaperGraphData(childId, startDate);
    default:
      throw new Error("지원되지 않는 그래프 타입입니다.");
  }
}

// 수유 그래프 데이터 추출
async function getFeedingGraphData(childId: string, startDate: Date) {
  // 수유 기록 조회
  const records = await prisma.record.findMany({
    where: {
      childId,
      type: "FEEDING",
      startTime: {
        gte: startDate,
      },
    },
    select: {
      startTime: true,
      amount: true,
      mealType: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  console.log("수유 기록 조회 결과:", records);

  // 데이터가 없는 경우 빈 배열 반환
  if (records.length === 0) {
    return {
      total: [],
      byType: [],
    };
  }

  // 일별 수유 데이터 집계
  const dailyData: Record<
    string,
    {
      totalAmount: number;
      count: number;
      milk: number;
      formula: number;
      babyfd: number;
      mixed: number;
    }
  > = {};

  // 모든 기록을 순회하며 일별 데이터 구성
  records.forEach((record) => {
    const date = dayjs(record.startTime).format("YYYY-MM-DD");

    // 해당 날짜의 데이터가 없으면 초기화
    if (!dailyData[date]) {
      dailyData[date] = {
        totalAmount: 0,
        count: 0,
        milk: 0,
        formula: 0,
        babyfd: 0,
        mixed: 0,
      };
    }

    // 총 수유량과 횟수 증가
    if (record.amount) {
      dailyData[date].totalAmount += record.amount;
      dailyData[date].count++;

      // 수유 유형별 데이터 추가
      switch (record.mealType) {
        case "모유":
          dailyData[date].milk += record.amount;
          break;
        case "분유":
          dailyData[date].formula += record.amount;
          break;
        case "이유식":
          dailyData[date].babyfd += record.amount;
          break;
        case "혼합":
          dailyData[date].mixed += record.amount;
          break;
        default:
          console.log(
            `알 수 없는 수유 유형: ${record.mealType}, 기본값으로 처리`
          );
          // 알 수 없는 유형은 총량에만 포함하고 유형별 데이터에는 포함하지 않음
          break;
      }
    }
  });

  console.log("일별 수유 데이터:", dailyData);

  // 응답 데이터 구성
  const totalData = Object.entries(dailyData).map(([date, data]) => ({
    date,
    amount: data.totalAmount,
    count: data.count,
  }));

  const byTypeData = Object.entries(dailyData).map(([date, data]) => ({
    date,
    milk: data.milk,
    formula: data.formula,
    babyfd: data.babyfd,
    mixed: data.mixed,
  }));

  return {
    total: totalData,
    byType: byTypeData,
  };
}

// 수면 그래프 데이터 추출
async function getSleepGraphData(childId: string, startDate: Date) {
  const records = await prisma.record.findMany({
    where: {
      childId,
      type: "SLEEP",
      startTime: {
        gte: startDate,
      },
    },
    select: {
      startTime: true,
      endTime: true,
      sleepType: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // 데이터가 없는 경우 빈 객체 반환
  if (records.length === 0) {
    return {
      total: [],
      dayTime: [],
      nightTime: [],
    };
  }

  // 일별 수면 데이터 계산
  const dailySleepData = records.reduce((acc, record) => {
    const date = dayjs(record.startTime).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = {
        totalSleepTime: 0,
        dayTimeSleep: 0,
        nightTimeSleep: 0,
        naps: 0,
      };
    }

    // 수면 시간 계산 (분 단위)
    if (record.startTime && record.endTime) {
      const sleepDuration = dayjs(record.endTime).diff(
        record.startTime,
        "minute"
      );
      acc[date].totalSleepTime += sleepDuration;

      if (record.sleepType === "낮잠") {
        acc[date].dayTimeSleep += sleepDuration;
        acc[date].naps++;
      } else if (record.sleepType === "밤잠") {
        acc[date].nightTimeSleep += sleepDuration;
      }
    }

    return acc;
  }, {} as Record<string, any>);

  // 데이터 포맷팅
  return {
    total: Object.entries(dailySleepData).map(([date, data]) => ({
      date,
      sleepTime: data.totalSleepTime,
    })),
    dayTime: Object.entries(dailySleepData).map(([date, data]) => ({
      date,
      sleepTime: data.dayTimeSleep,
      naps: data.naps,
    })),
    nightTime: Object.entries(dailySleepData).map(([date, data]) => ({
      date,
      sleepTime: data.nightTimeSleep,
    })),
  };
}

// 체온 그래프 데이터 추출
async function getTemperatureGraphData(childId: string, startDate: Date) {
  const records = await prisma.record.findMany({
    where: {
      childId,
      type: "TEMPERATURE",
      startTime: {
        gte: startDate,
      },
    },
    select: {
      startTime: true,
      temperature: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // 데이터가 없는 경우 빈 객체 반환
  if (records.length === 0) {
    return {
      average: [],
      max: [],
      min: [],
      all: [],
    };
  }

  // 일별 체온 데이터 계산
  const dailyTemperatureData = records.reduce((acc, record) => {
    const date = dayjs(record.startTime).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = {
        temperatures: [],
        avgTemperature: 0,
        maxTemperature: 0,
        minTemperature: 100, // 초기값을 높게 설정
      };
    }

    if (record.temperature) {
      acc[date].temperatures.push(record.temperature);

      // 최대/최소 체온 업데이트
      if (record.temperature > acc[date].maxTemperature) {
        acc[date].maxTemperature = record.temperature;
      }
      if (record.temperature < acc[date].minTemperature) {
        acc[date].minTemperature = record.temperature;
      }
    }

    return acc;
  }, {} as Record<string, any>);

  // 평균 체온 계산
  Object.keys(dailyTemperatureData).forEach((date) => {
    const temps = dailyTemperatureData[date].temperatures;
    if (temps.length > 0) {
      const sum = temps.reduce((a: number, b: number) => a + b, 0);
      dailyTemperatureData[date].avgTemperature = parseFloat(
        (sum / temps.length).toFixed(1)
      );
    }
    // 최소 체온이 초기값 그대로라면 (기록이 없다면) 0으로 설정
    if (dailyTemperatureData[date].minTemperature === 100) {
      dailyTemperatureData[date].minTemperature = 0;
    }
  });

  // 데이터 포맷팅
  return {
    average: Object.entries(dailyTemperatureData).map(([date, data]) => ({
      date,
      temperature: data.avgTemperature,
    })),
    max: Object.entries(dailyTemperatureData).map(([date, data]) => ({
      date,
      temperature: data.maxTemperature,
    })),
    min: Object.entries(dailyTemperatureData).map(([date, data]) => ({
      date,
      temperature: data.minTemperature,
    })),
    all: records.map((record) => ({
      date: dayjs(record.startTime).format("YYYY-MM-DD"),
      time: dayjs(record.startTime).format("HH:mm"),
      temperature: record.temperature,
    })),
  };
}

// 배변 그래프 데이터 추출
async function getDiaperGraphData(childId: string, startDate: Date) {
  const records = await prisma.record.findMany({
    where: {
      childId,
      type: "DIAPER",
      startTime: {
        gte: startDate,
      },
    },
    select: {
      startTime: true,
      diaperType: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // 데이터가 없는 경우 빈 객체 반환
  if (records.length === 0) {
    return {
      total: [],
      pee: [],
      poo: [],
      mixed: [],
      byType: [],
    };
  }

  // 일별 배변 데이터 계산
  const dailyDiaperData = records.reduce((acc, record) => {
    const date = dayjs(record.startTime).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = {
        total: 0,
        pee: 0,
        poo: 0,
        mixed: 0,
      };
    }

    acc[date].total += 1;

    if (record.diaperType === "소변") {
      acc[date].pee += 1;
    } else if (record.diaperType === "대변") {
      acc[date].poo += 1;
    } else if (record.diaperType === "혼합") {
      acc[date].mixed += 1;
    }

    return acc;
  }, {} as Record<string, any>);

  // 데이터 포맷팅
  return {
    total: Object.entries(dailyDiaperData).map(([date, data]) => ({
      date,
      count: data.total,
    })),
    pee: Object.entries(dailyDiaperData).map(([date, data]) => ({
      date,
      count: data.pee,
    })),
    poo: Object.entries(dailyDiaperData).map(([date, data]) => ({
      date,
      count: data.poo,
    })),
    mixed: Object.entries(dailyDiaperData).map(([date, data]) => ({
      date,
      count: data.mixed,
    })),
    byType: Object.entries(dailyDiaperData).map(([date, data]) => ({
      date,
      pee: data.pee,
      poo: data.poo,
      mixed: data.mixed,
    })),
  };
}
