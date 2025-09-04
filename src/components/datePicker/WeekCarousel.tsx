import { Carousel } from "@mantine/carousel";
import { Box, Center, Flex, Text, UnstyledButton } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import dayjs, { Dayjs } from "dayjs";
import { EmblaCarouselType } from "embla-carousel-react";
import { useEffect, useRef, useState } from "react";

const WEEK_COUNT = 50;

export default function WeeklyDatePicker({
  currentDate,
  onSelect,
}: {
  currentDate: Dayjs;
  onSelect: (date: Dayjs) => void;
}) {
  const emblaApi = useRef<EmblaCarouselType | null>(null);
  const { width } = useViewportSize();
  const [weeks, setWeeks] = useState<Dayjs[][]>([]);

  // 주간 날짜 배열 생성 함수
  const generateWeeks = (baseDate: Dayjs) => {
    const result: Dayjs[][] = [];

    // 현재 주의 일요일 찾기
    const currentSunday = baseDate.day(0);

    for (let weekIndex = -WEEK_COUNT; weekIndex < 1; weekIndex++) {
      const weekDates: Dayjs[] = [];

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        // weekIndex = 0이 현재 주
        weekDates.push(currentSunday.add(weekIndex * 7 + dayIndex, "day"));
      }

      result.push(weekDates);
    }

    return result;
  };

  useEffect(() => {
    if (weeks.length === 0) {
      const generatedWeeks = generateWeeks(currentDate);
      setWeeks(generatedWeeks);
    } else {
      if (currentDate.isSame(dayjs(), "day")) {
        emblaApi.current?.scrollTo(WEEK_COUNT);
      }
    }
  }, [currentDate]);

  return (
    <Box
      style={{
        overflow: "hidden",
        borderBottom: "1px solid #D9D9D9",
        paddingBottom: "16px",
      }}
    >
      <WeekDays width={width} />
      <Carousel
        getEmblaApi={(api) => (emblaApi.current = api)}
        styles={{
          container: {
            display: "flex",
          },
        }}
        withControls={false}
        withIndicators={false}
        align="center"
        slidesToScroll={1} // 한 번에 한 슬라이드씩 스크롤
        initialSlide={WEEK_COUNT}
      >
        {weeks.map((week) => (
          <Carousel.Slide key={week[0].format("YYYY-MM-DD")}>
            <Row
              width={width}
              items={week}
              currentDate={currentDate}
              onSelect={onSelect}
            />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}

const Row = ({
  items,
  width,
  currentDate,
  onSelect,
}: {
  items: Dayjs[];
  width: number;
  currentDate: Dayjs;
  onSelect: (date: Dayjs) => void;
}) => {
  const today = dayjs().format("YYYY-MM-DD");

  return (
    <Flex w={width} justify="space-between" p="0 8px">
      {items.map((item, i) => (
        <UnstyledButton
          key={i}
          w={33}
          h={33}
          style={{
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          bg={
            item.format("YYYY-MM-DD") === currentDate.format("YYYY-MM-DD")
              ? "brand.7"
              : item.format("YYYY-MM-DD") === today
              ? "brand.1"
              : undefined
          }
          onClick={() => onSelect(item)}
        >
          <Text
            size={"md"}
            fw={600}
            c={
              item.format("YYYY-MM-DD") === currentDate.format("YYYY-MM-DD")
                ? "white"
                : undefined
            }
            lh={0}
          >
            {item.format("D")}
          </Text>
        </UnstyledButton>
      ))}
    </Flex>
  );
};

const WeekDays = ({ width }: { width: number }) => {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <Flex w={width} justify="space-between" p="0 8px" mb="xs">
      {weekdays.map((day) => (
        <Center key={day} w={33} h={33} style={{ borderRadius: "8px" }}>
          <Text
            size="sm"
            fw={600}
            c={day === "일" ? "red" : day === "토" ? "blue" : undefined}
          >
            {day}
          </Text>
        </Center>
      ))}
    </Flex>
  );
};
