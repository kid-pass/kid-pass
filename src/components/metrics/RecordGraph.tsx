"use client";

import React, { useState, useEffect } from "react";
import { Box, Stack, Title, Paper, Flex } from "@mantine/core";
import { BarChart, LineChart } from "@mantine/charts";
import useAuth from "@/hook/useAuth";
import dayjs from "dayjs";
import { useAuthStore } from "@/store/useAuthStore";

// 기간 옵션
const PERIOD_OPTIONS = [
  { value: "month", label: "1개월" },
  { value: "quarter", label: "3개월" },
  { value: "year", label: "1년" },
];

const RecordGraph = ({ initPeriod = "quarter" }: { initPeriod?: string }) => {
  const [period, setPeriod] = useState<string>(initPeriod);
  const [graphData, setGraphData] = useState<any>({
    FEEDING: {},
    SLEEP: {},
    TEMPERATURE: {},
    DIAPER: {},
  });
  const { getToken } = useAuth();
  const { crtChldrnNo } = useAuthStore();

  // 그래프 데이터 fetching
  const fetchGraphData = async (type: string) => {
    try {
      const token = await getToken();

      const response = await fetch(
        `/api/graph?childId=${crtChldrnNo}&type=${type}&period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        // 데이터가 비어있는지 확인
        const isEmpty =
          !result.data ||
          Object.keys(result.data).length === 0 ||
          Object.values(result.data).every((arr: any) => arr.length === 0);

        if (isEmpty) {
          setGraphData((prev: any) => ({
            ...prev,
            [type]: { isEmpty: true },
          }));
          return;
        }

        // 날짜 포맷팅 로직
        const formattedData = Object.keys(result.data).reduce(
          (acc: any, key) => {
            acc[key] = result.data[key].map((item: any) => ({
              ...item,
              date: dayjs(item.date).format("M.D"),
            }));
            return acc;
          },
          {}
        );

        setGraphData((prev: any) => ({
          ...prev,
          [type]: formattedData,
        }));
      }
    } catch (error) {
      console.error(`Graph data fetch error for ${type}:`, error);
      setGraphData((prev: any) => ({
        ...prev,
        [type]: { error: true },
      }));
    }
  };

  // 데이터 변경 시 다시 fetching
  useEffect(() => {
    fetchGraphData("FEEDING");
    fetchGraphData("SLEEP");
    fetchGraphData("TEMPERATURE");
    fetchGraphData("DIAPER");
  }, [period]);

  // 수유 그래프 렌더링
  const renderFeedingGraphs = () => {
    // 데이터가 없거나 오류가 있는 경우
    if (graphData.FEEDING.isEmpty || graphData.FEEDING.error) {
      return (
        <Stack gap="md">
          <Paper withBorder p="md" radius="md" h={300}>
            <Flex direction="column" align="center" justify="center" h="100%">
              <Title order={5} c="dimmed">
                {graphData.FEEDING.error
                  ? "데이터를 불러오는 중 오류가 발생했습니다."
                  : "기록된 수유 데이터가 없습니다."}
              </Title>
            </Flex>
          </Paper>
        </Stack>
      );
    }

    return (
      <Stack gap="md">
        {/* 수유 유형별 그래프 (스택형) */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">
            식사 패턴
          </Title>
          <BarChart
            h={300}
            data={graphData.FEEDING.byType || []}
            dataKey="date"
            series={[
              {
                name: "milk",
                color: "blue.6",
                label: "모유",
              },
              {
                name: "formula",
                color: "green.6",
                label: "분유",
              },
              {
                name: "babyfd",
                color: "yellow.6",
                label: "이유식",
              },
              {
                name: "mixed",
                color: "orange.6",
                label: "혼합",
              },
            ]}
            type="stacked"
            tickLine="y"
            gridAxis="x"
            valueFormatter={(value) => `${value}ml`}
            withYAxis={false}
          />
        </Paper>
      </Stack>
    );
  };

  // 수면 그래프 렌더링
  const renderSleepGraphs = () => {
    // 데이터가 없거나 오류가 있는 경우
    if (graphData.SLEEP.isEmpty || graphData.SLEEP.error) {
      return (
        <Stack gap="md">
          <Paper withBorder p="md" radius="md" h={300}>
            <Flex direction="column" align="center" justify="center" h="100%">
              <Title order={5} c="dimmed">
                {graphData.SLEEP.error
                  ? "데이터를 불러오는 중 오류가 발생했습니다."
                  : "기록된 수면 데이터가 없습니다."}
              </Title>
            </Flex>
          </Paper>
        </Stack>
      );
    }

    return (
      <Stack gap="md">
        {/* 총 수면 시간 그래프 - 라인 차트로 변경 */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">
            수면 패턴
          </Title>
          <LineChart
            h={300}
            data={graphData.SLEEP.total || []}
            dataKey="date"
            series={[
              {
                name: "sleepTime",
                color: "blue.6",
                label: "총 수면 시간 (분)",
              },
            ]}
            tickLine="y"
            gridAxis="x"
            valueFormatter={(value) => `${value} 분`}
            withYAxis={false}
          />
        </Paper>
      </Stack>
    );
  };

  // 체온 그래프 렌더링
  const renderTemperatureGraphs = () => {
    // 데이터가 없거나 오류가 있는 경우
    if (graphData.TEMPERATURE.isEmpty || graphData.TEMPERATURE.error) {
      return (
        <Stack gap="md">
          <Paper withBorder p="md" radius="md" h={300}>
            <Flex direction="column" align="center" justify="center" h="100%">
              <Title order={5} c="dimmed">
                {graphData.TEMPERATURE.error
                  ? "데이터를 불러오는 중 오류가 발생했습니다."
                  : "기록된 체온 데이터가 없습니다."}
              </Title>
            </Flex>
          </Paper>
        </Stack>
      );
    }

    return (
      <Stack gap="md">
        {/* 체온 변화 그래프 */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">
            체온 기록
          </Title>
          <LineChart
            h={300}
            data={graphData.TEMPERATURE.average || []}
            dataKey="date"
            series={[
              {
                name: "temperature",
                color: "red.6",
                label: "평균 체온 (°C)",
              },
            ]}
            tickLine="y"
            gridAxis="x"
            valueFormatter={(value) => `${value}°C`}
            withYAxis={false}
          />
        </Paper>

        {/* 최고/최저 체온 그래프 */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">
            최고/최저 체온
          </Title>
          <LineChart
            h={300}
            data={graphData.TEMPERATURE.max || []}
            dataKey="date"
            series={[
              {
                name: "temperature",
                color: "red.6",
                label: "최고 체온 (°C)",
              },
            ]}
            tickLine="y"
            gridAxis="x"
            valueFormatter={(value) => `${value}°C`}
            withYAxis={false}
          />
          <LineChart
            h={300}
            data={graphData.TEMPERATURE.min || []}
            dataKey="date"
            series={[
              {
                name: "temperature",
                color: "blue.6",
                label: "최저 체온 (°C)",
              },
            ]}
            tickLine="y"
            gridAxis="x"
            valueFormatter={(value) => `${value}°C`}
            withYAxis={false}
          />
        </Paper>
      </Stack>
    );
  };

  // 배변 그래프 렌더링
  const renderDiaperGraphs = () => {
    // 데이터가 없거나 오류가 있는 경우
    if (graphData.DIAPER.isEmpty || graphData.DIAPER.error) {
      return (
        <Stack gap="md">
          <Paper withBorder p="md" radius="md" h={300}>
            <Flex direction="column" align="center" justify="center" h="100%">
              <Title order={5} c="dimmed">
                {graphData.DIAPER.error
                  ? "데이터를 불러오는 중 오류가 발생했습니다."
                  : "기록된 배변 데이터가 없습니다."}
              </Title>
            </Flex>
          </Paper>
        </Stack>
      );
    }

    return (
      <Stack gap="md">
        {/* 배변 유형별 그래프 (스택형) */}
        <Paper withBorder p="md" radius="md">
          <Title order={5} mb="md">
            배변 패턴
          </Title>
          <BarChart
            h={300}
            data={graphData.DIAPER.byType || []}
            dataKey="date"
            series={[
              {
                name: "pee",
                color: "blue.6",
                label: "소변",
              },
              {
                name: "poo",
                color: "yellow.6",
                label: "대변",
              },
              {
                name: "mixed",
                color: "green.6",
                label: "혼합",
              },
            ]}
            type="stacked"
            tickLine="y"
            gridAxis="x"
            valueFormatter={(value) => `${value}회`}
            withYAxis={false}
          />
        </Paper>
      </Stack>
    );
  };

  return (
    <Stack gap="xs">
      {/* 기간 선택 컨트롤은 주석 처리되어 있으므로 그대로 유지 */}
      {/* <Flex justify="flex-end">
        <Group justify="center">
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            data={PERIOD_OPTIONS}
            size="md"
          />
        </Group>
      </Flex> */}

      {/* 모든 그래프 렌더링 */}

      {renderFeedingGraphs()}
      {renderSleepGraphs()}
      {renderTemperatureGraphs()}
      {renderDiaperGraphs()}
    </Stack>
  );
};

export default RecordGraph;
