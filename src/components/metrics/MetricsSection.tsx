import React from "react";
import { Stack, Text } from "@mantine/core";
import RecordGraph from "./RecordGraph";

interface MetricsDetail {
  label: string;
  value: string;
}

interface MetricsSectionProps {
  labelText: string;
  metricsData: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    details?: MetricsDetail[]; // 세부사항
    bodyTempComponent?: React.ReactNode; // BodyTemp 컴포넌트와 같은 특별한 컴포넌트
  }[];
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ labelText }) => {
  return (
    <Stack mt={40} mb={48} gap="md">
      <Text fw={700} fz="lg">
        {labelText}
      </Text>
      <RecordGraph />
    </Stack>
  );
};

export { MetricsSection };
