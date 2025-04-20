"use client";

import { Box, Stack, Text, SimpleGrid, Group, Center } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { FormValues } from "../RecordForm";

const BUS = ["대변", "소변"];
const COLORS = ["노란색", "갈색", "검은색", "빨간색", "흰색", "회색"];
const COLORSVALUE = [
  "#D1B905",
  "#844A2A",
  "#444444",
  "#D13805",
  "#E8E8E8",
  "#8D8D8D",
];
const STLES = ["물변", "딱딱함", "적당함"];
const AMTS = ["적음", "보통", "많음"];

interface DiaperFieldsProps {
  form: UseFormReturnType<FormValues>;
}

const DiaperFields = ({ form }: DiaperFieldsProps) => {
  return (
    <Stack gap="md">
      <Box>
        <Text fw={600} fz="md" mb="xs">
          종류
        </Text>
        <SimpleGrid cols={2} spacing="xs">
          {BUS.map((type) => (
            <Box
              key={type}
              p="md"
              style={{
                borderRadius: "8px",
                border: "1px solid",
                borderColor:
                  form.values.diaperType === type
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-3)",
                backgroundColor:
                  form.values.diaperType === type
                    ? "var(--mantine-color-blue-0)"
                    : "transparent",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: form.values.diaperType === type ? 600 : 400,
              }}
              onClick={() => form.setFieldValue("diaperType", type)}
            >
              {type}
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Text fw={600} fz="md" mb="xs">
          색깔
        </Text>
        <SimpleGrid cols={3} spacing="xs">
          {COLORS.map((color, index) => (
            <Box
              key={color}
              p="md"
              style={{
                borderRadius: "8px",
                border: "1px solid",
                borderColor:
                  form.values.diaperColor === color
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-3)",
                backgroundColor:
                  form.values.diaperColor === color
                    ? "var(--mantine-color-blue-0)"
                    : "transparent",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: form.values.diaperColor === color ? 600 : 400,
              }}
              onClick={() => form.setFieldValue("diaperColor", color)}
            >
              <Group
                gap="xs"
                justify="center"
                align="center"
                style={{ flexDirection: "column" }}
              >
                <Box
                  style={{
                    backgroundColor: COLORSVALUE[index],
                    width: 24,
                    height: 24,
                    borderRadius: 24,
                  }}
                />
                <Text>{color}</Text>
              </Group>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Text fw={600} fz="md" mb="xs">
          형태
        </Text>
        <SimpleGrid cols={3} spacing="xs">
          {STLES.map((shape) => (
            <Box
              key={shape}
              p="md"
              style={{
                borderRadius: "8px",
                border: "1px solid",
                borderColor:
                  form.values.diaperShape === shape
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-3)",
                color:
                  form.values.diaperShape === shape
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-6)",
                cursor: "pointer",
                textAlign: "center",
              }}
              onClick={() => form.setFieldValue("diaperShape", shape)}
            >
              {shape}
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Text fw={600} fz="md" mb="xs">
          양
        </Text>
        <SimpleGrid cols={3} spacing="xs">
          {AMTS.map((amount, index) => (
            <Box
              key={`${amount}-${index}`}
              p="md"
              style={{
                borderRadius: "8px",
                border: "1px solid",
                borderColor:
                  form.values.diaperAmount === amount
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-3)",
                color:
                  form.values.diaperAmount === amount
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-6)",
                cursor: "pointer",
                textAlign: "center",
              }}
              onClick={() => form.setFieldValue("diaperAmount", amount)}
            >
              {amount}
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Stack>
  );
};

export default DiaperFields;
