import { DaySchedule, ScheduleItem } from "@/app/record/components/Schedule";

export const formatRecordData = (
  groupedRecords: Record<string, any[]>
): DaySchedule[] => {
  return Object.entries(groupedRecords).map(([date, records]) => {
    const [year, month, day] = date.split("-");
    const recordDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );

    return {
      date: `${month}월 ${day}일`,
      dayOfWeek: new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(
        recordDate
      ),
      items: records.map((record) => formatRecordItem(record)),
    };
  });
};

const TYPE_MAP = {
  FEEDING: "수유",
  SLEEP: "수면",
  DIAPER: "배설",
  TEMPERATURE: "체온",
  GROWTH: "신체정보",
  HEAD: "머리둘레",
  EMOTION: "감정",
  SYMPTOM: "특이증상",
  MEDICINE: "약",
  ETC: "기타",
} as const;

type RecordType = keyof typeof TYPE_MAP;

const formatRecordItem = (record: any): ScheduleItem => {
  const time = new Date(record.startTime);
  const hours = time.getHours();
  const minutes = time.getMinutes();

  return {
    ...record,
    id: record.id,
    type: record.type,
    time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`,
    ampm: hours < 12 ? ("AM" as const) : ("PM" as const),
    content: TYPE_MAP[record.type as RecordType] ?? "기타",
    duration: record.endTime
      ? `${Math.round(
          (new Date(record.endTime).getTime() - time.getTime()) / (1000 * 60)
        )}분`
      : undefined,
  };
};
