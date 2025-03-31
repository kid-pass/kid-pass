"use client";

import { useEffect, useState } from "react";
import { MetricsSection } from "@/components/metrics/MetricsSection";
import Link from "next/link";
import ProfileCarousel from "./ProfileCarousel";
import useAuth from "@/hook/useAuth";
import { useRouter } from "next/navigation";
import useChldrnListStore from "@/store/useChldrnListStore";
import MobileLayout from "@/components/mantine/MobileLayout";
import {
  Group,
  Text,
  Image,
  Stack,
  Flex,
  Container,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useAuthStore } from "@/store/useAuthStore";

interface PhysicalStats {
  chldrnBdwgh: number;
  chldrnHead: number;
  chldrnHeight: number;
  chldrnNo: string;
}

export interface KidProfile {
  age: number;
  atchCode: string;
  chldrnBrthdy?: string;
  chldrnInfoList: [PhysicalStats];
  chldrnNm: string;
  chldrnNo: string;
  days: number;
  weeks: number;
}

interface RecordMetricsDetail {
  label: string;
  value: string;
}

interface RecordMetrics {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  details: RecordMetricsDetail[];
}

export interface KidRecord {
  profile: KidProfile;
  metrics: RecordMetrics[];
}

interface Child {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  weight: number | null;
  height: number | null;
  headCircumference: number | null;
  ageType: string | null;
  allergies: string[];
  symptoms: string[];
  memo: string | null;
}

const calculateAgeInWeeksAndDays = (birthDate: string) => {
  const birth = new Date(birthDate);
  const today = new Date();

  // 나이 계산 (만 나이)
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  // 일수와 주수 계산
  const diffTime = Math.abs(today.getTime() - birth.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return {
    weeks: diffDays / 7,
    days: diffDays,
    age: age, // 만 나이로 변경
  };
};

const createMockMetrics = (
  kidName: string,
  kidIndex: number,
  toggleMetric: (kidIndex: number, metricIndex: number) => void
) => [
  {
    title: "수면패턴",
    isOpen: true,
    onToggle: () => toggleMetric(kidIndex, 0),
    details: [
      { label: "간격", value: "3회" },
      { label: "횟수", value: "6회" },
    ],
  },
  {
    title: "식사패턴",
    isOpen: true,
    onToggle: () => toggleMetric(kidIndex, 1),
    details: [
      { label: "간격", value: "2시간" },
      { label: "횟수", value: "6회" },
    ],
  },
  {
    title: "배변패턴",
    isOpen: true,
    onToggle: () => toggleMetric(kidIndex, 2),
    details: [
      { label: "대변", value: "6회" },
      { label: "소변", value: "6회" },
      {
        label: "대변색깔",
        value: kidName === "정민규" ? "묽은 변" : "정상",
      },
    ],
  },
];

// 아이 데이터 가공 함수 분리
const processChildData = (
  children: Child[],
  toggleMetric: (kidIndex: number, metricIndex: number) => void
) => {
  return children.map((child, index) => {
    const { weeks, days, age } = calculateAgeInWeeksAndDays(child.birthDate);

    return {
      profile: {
        chldrnNm: child.name,
        chldrnBrthdy: child.birthDate,
        ageType: child.ageType ?? "",
        age: age,
        chldrnNo: child.id,
        atchCode: "",
        days,
        weeks,
        chldrnInfoList: [
          {
            chldrnBdwgh: child.weight ?? 0,
            chldrnHead: child.headCircumference ?? 0,
            chldrnHeight: child.height ?? 0,
            chldrnNo: child.id,
          },
        ] as [PhysicalStats],
      },
      metrics: createMockMetrics(child.name, index, toggleMetric),
    };
  });
};

const App: React.FC = () => {
  const theme = useMantineTheme();
  const router = useRouter();
  const [kidsData, setKidsData] = useState<KidRecord[]>([]);
  const [currentKidIndex, setCurrentKidIndex] = useState(0);
  const { setChldrnList, setCurrentKid } = useChldrnListStore();
  const { getToken } = useAuth();
  const { setCrtChldrnNo } = useAuthStore();

  useEffect(() => {
    fetchChildrenData();
  }, []);

  const fetchChildrenData = async () => {
    const token = await getToken();

    if (!token) {
      router.push("auth/login");
      return;
    }

    try {
      const response = await fetch("/api/child/getChildren", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.data) {
        handleChildrenData(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // 데이터 처리 함수를 분리
  const handleChildrenData = (children: Child[]) => {
    if (children.length > 0) {
      localStorage.setItem("currentKid", children[0].id);

      // 로그인과 동시에 아이번호  zustand 에 저장
      setCurrentKid(children[0].id);
      setCrtChldrnNo(children[0].id);
    }

    const childrenToStore = children.map((child) => ({
      chldrnNo: child.id,
      chldrnNm: child.name,
      chldrnSexdstn: child.gender,
    }));

    setChldrnList(childrenToStore);
    const processedData = processChildData(children, toggleMetric);
    setKidsData(processedData);
  };
  // 특정 메트릭 업데이트 함수 분리
  const updateMetricState = (metrics: any[], metricIndex: number) => {
    return metrics.map((metric, mIdx) => {
      if (mIdx === metricIndex) {
        return {
          ...metric,
          isOpen: !metric.isOpen,
        };
      }
      return metric;
    });
  };

  // 메인 토글 함수
  const toggleMetric = (kidIndex: number, metricIndex: number) => {
    setKidsData((prevData) => {
      return prevData.map((kid, idx) => {
        if (idx === kidIndex) {
          return {
            ...kid,
            metrics: updateMetricState(kid.metrics, metricIndex),
          };
        }
        return kid;
      });
    });
  };

  const currentKid = kidsData[currentKidIndex];

  return (
    <MobileLayout
      showHeader={false}
      headerType="profile"
      title="홈"
      showBottomNav={true}
      currentRoute="/"
    >
      <Container>
        <Group justify="space-between" align="center" w="100%" mb="md">
          <Text size="xl" ff="HakgyoansimWoojuR" c="#222222">
            오늘의아이
          </Text>
          <Image
            src="https://heidimoon.cafe24.com/renwal/test2/Bell.svg"
            alt="알림"
          />
        </Group>
        <ProfileCarousel
          profiles={kidsData}
          onSlideChange={setCurrentKidIndex}
        />
        <Group
          bg={theme.colors.brand[7]}
          p="lg"
          align="center"
          pos="relative"
          style={{ borderRadius: "8px" }}
        >
          <IconPlus color="#FFFFFF" size={12} strokeWidth={4} />
          <Text c="white" fw={700} fz="md">
            오늘의 아이 증상 기록하기
          </Text>

          <Image
            src="/record.png"
            alt=""
            pos="absolute"
            right={10}
            w={80}
            h={80}
          />
        </Group>

        <Group gap="xs" align="center" mt="md">
          <Flex
            component={Link}
            href="/map"
            p="md"
            bg="white"
            justify="space-between"
            align="center"
            flex={1}
            styles={{
              root: {
                border: "1px solid #d5d5d5",
                borderRadius: "8px",
                flex: "1",
                textDecoration: "none",
              },
            }}
          >
            <Stack justify="center" gap={0}>
              <Text fw={700} fz="md" c="#222222">
                지금 문 연
              </Text>
              <Text fw={700} fz="md" c="#222222">
                병원/약국
              </Text>
            </Stack>
            <Image
              src="https://heidimoon.cafe24.com/renwal/test2/Group.png"
              alt="병원/약국"
              width={36}
              height={36}
            />
          </Flex>

          <Flex
            component={Link}
            href="/map"
            p="md"
            bg="white"
            justify="space-between"
            align="center"
            styles={{
              root: {
                border: "1px solid #d5d5d5",
                borderRadius: "8px",
                flex: "1",
                textDecoration: "none",
              },
            }}
          >
            <Stack justify="center" gap={0}>
              <Text fw={700} fz="md" c="#222222">
                진료받은
              </Text>
              <Text fw={700} fz="md" c="#222222">
                기록
              </Text>
            </Stack>
            <Image
              src="https://heidimoon.cafe24.com/renwal/test2/OBJECTS.png"
              alt="기록"
              width={36}
              height={36}
            />
          </Flex>
        </Group>
        {currentKid && (
          <MetricsSection
            labelText={`오늘의 ${currentKid.profile.chldrnNm} 기록이에요`}
            metricsData={currentKid.metrics}
          />
        )}
      </Container>
    </MobileLayout>
  );
};

export default App;
