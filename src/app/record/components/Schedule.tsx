import React from "react";
import { Box, Flex, Text, Stack, UnstyledButton } from "@mantine/core";
import { useRouter } from "next/navigation";

export interface ScheduleItem {
  time: string;
  ampm: "AM" | "PM";
  content: keyof typeof CategoryMapColor;
  duration?: string;
  amount?: string;
  unit?: string;
  id: string;
  type: string;
  sleepType?: string;
  mealType?: string;
  temperature?: number;
  weight?: number;
  height?: number;
  headSize?: number;
  emotion?: string;
  diaperType?: string;
  medicine?: string;
}

export interface DaySchedule {
  date: string;
  dayOfWeek: string;
  items: ScheduleItem[];
}

interface ScheduleProps {
  schedules: DaySchedule[];
}

const CategoryMapColor = {
  수유: "#729BED",
  배설: "#A0DBF9",
  수면: "#71E0E0",
  체온: "#FFB6D7",
  "몸무게/키": "#FFDE79",
  머리둘레: "#BEBEFA",
  감정: "#EAC2FF",
  특이증상: "#FFB7B8",
  약: "#A7FFAC",
  기타: "#729BED",
};

const Schedule: React.FC<ScheduleProps> = ({ schedules }) => {
  const router = useRouter();

  const handleItemClick = (item: ScheduleItem) => {
    router.push(`/record/${item.type}/${item.id}`);
  };

  return (
    <Box p="md">
      {schedules.map((daySchedule, dayIndex) => (
        <Box key={dayIndex} mb={24}>
          <Flex gap="xs" mb="md">
            <Text fw={700} fz={18}>
              {daySchedule.date}
            </Text>
            <Text fw={700} fz={18}>
              {daySchedule.dayOfWeek}
            </Text>
          </Flex>

          <Stack gap="xs">
            {daySchedule.items.map((item, itemIndex) => {
              const additionalDetails = [
                item.duration,
                item.amount && `${item.amount}${item.unit}`,
                item.sleepType,
                item.mealType,
                item.temperature && `${item.temperature}℃`,
                item.weight && `몸무게 ${item.weight}kg`,
                item.height && `키 ${item.height}cm`,
                item.headSize && `두위 ${item.headSize}cm`,
                item.emotion,
                item.diaperType,
                item.medicine,
              ].filter(Boolean);
              const displayDetails = additionalDetails.join(", ");

              return (
                <UnstyledButton
                  key={itemIndex}
                  onClick={() => handleItemClick(item)}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    borderTop: "1px solid #f4f4f4",
                    paddingTop: 12,
                  }}
                >
                  <Flex gap="md" py="xs" align="flex-start">
                    <Flex gap="xs" style={{ flex: 1 }}>
                      <Text fz={15} fw={600}>
                        {item.time}
                      </Text>
                      <Text fz={14} fw={600} c="#d9d9d9" mt={2}>
                        {item.ampm}
                      </Text>
                    </Flex>

                    <Flex gap="xs" style={{ flex: 3 }}>
                      <Text
                        fz={15}
                        fw={800}
                        style={{ color: CategoryMapColor[item.content] }}
                      >
                        {item.content}
                      </Text>

                      <Text fz={15} lineClamp={1} w={150}>
                        {displayDetails}
                      </Text>
                    </Flex>
                  </Flex>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

export default Schedule;
