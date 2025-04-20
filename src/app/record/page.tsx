"use client";

import { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Text,
  Button,
  Image,
  Card,
  Space,
  UnstyledButton,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import useAuth from "@/hook/useAuth";
import { modals } from "@mantine/modals";
import Schedule, { DaySchedule } from "@/app/record/components/Schedule";
import { formatRecordData } from "./utils";
import { RECORDS, SLIDES } from "./constants";
import MobileLayout from "@/components/mantine/MobileLayout";
import { bottomModalTheme } from "@/utils/mantine.theme";
import { Carousel } from "@mantine/carousel";
import Empty from "@/components/mantine/Empty";
import Spacer from "@/elements/spacer/Spacer";
import useCurrentDateStore from "@/store/useCurrentDateStore";
import { IconPlus } from "@tabler/icons-react";

const RecordPage = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  const { currentDate } = useCurrentDateStore();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [scheduleData, setScheduleData] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = async () => {
    try {
      const token = await getToken();
      const currentKid = localStorage.getItem("currentKid");

      if (!token || !currentKid) {
        return;
      }

      setIsLoading(true);
      const response = await fetch(
        `/api/record?childId=${currentKid}&startDate=${currentDate.format(
          "YYYY-MM-DD"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response);
      if (response.ok) {
        const { data } = await response.json();
        const formattedData = formatRecordData(data);
        setScheduleData(formattedData);
      }
    } catch (error) {
      console.error("기록 조회 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((item) => item !== index);
      }
      return [...prev, index];
    });
  };

  const openRecordModal = () => {
    modals.open({
      ...bottomModalTheme,
      title: "오늘의 아이 기록하기",
      children: (
        <Box p="sm">
          <Grid>
            {RECORDS.map((record) => (
              <Grid.Col span={4} key={record.path}>
                <Card
                  radius="md"
                  mah={"88"}
                  bg="brand.0"
                  onClick={() => {
                    modals.closeAll();
                    router.push(record.path);
                  }}
                >
                  <Image
                    src={record.src}
                    alt={record.title}
                    width={24}
                    style={{ objectFit: "contain" }}
                    height={24}
                  />
                  <Space h={4} />
                  <Text size="md" ta="center" fw={600}>
                    {record.title}
                  </Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Box>
      ),
    });
  };

  useEffect(() => {
    fetchRecords();
  }, [currentDate]);

  return (
    <MobileLayout
      showHeader={true}
      headerType="profile"
      title="아이기록"
      showBottomNav={true}
      currentRoute="/record"
      useWeekCarousel={true}
    >
      <Box style={{ overflow: "hidden" }}>
        <Carousel
          withControls={false}
          slideGap="md"
          styles={{
            container: {
              display: "flex",
            },
          }}
          align="start"
          slidesToScroll={3}
        >
          {SLIDES.map((slide, index) => (
            <Carousel.Slide key={slide}>
              <UnstyledButton
                onClick={() => handleSelect(index)}
                w={100}
                bg={selectedItems.includes(index) ? "brand.7" : "brand.0"}
                fw={selectedItems.includes(index) ? 700 : 600}
                p="md"
                py={10}
                ml={6}
                c={selectedItems.includes(index) ? "white" : "black"}
                style={{
                  borderRadius: "20px",
                  textAlign: "center",
                }}
              >
                {slide}
              </UnstyledButton>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Box>

      <Spacer height={16} />

      {scheduleData.length > 0 ? (
        <Schedule schedules={scheduleData} />
      ) : isLoading ? (
        <></>
      ) : (
        <Empty
          title="아직 기록이 없네요!"
          text={`하루가 다르게 커가는\n아이의 기록을 남겨보세요 :)`}
        />
      )}

      <Button
        w={42}
        h={42}
        radius="xl"
        bg="brand.7"
        c="white"
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          padding: 0,
        }}
        onClick={openRecordModal}
      >
        <IconPlus size={24} stroke={3} />
      </Button>
    </MobileLayout>
  );
};

export default RecordPage;
