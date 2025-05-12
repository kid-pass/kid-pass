import React, { useState } from "react";
import { Text, Center, Stack, Title } from "@mantine/core";
import Image from "next/image";

interface EmptyProps {
  title?: string;
  text?: string;
}

const Empty: React.FC<EmptyProps> = ({
  title = "데이터가 없습니다.",
  text = "오늘 하루 기록을 남겨주세요.",
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Center h="100%" py="xl">
      <Stack align="center" gap="md">
        {!imgError ? (
          <Image
            src="/images/empty.webp"
            alt="No data"
            width={136}
            height={136}
            onError={() => setImgError(true)}
            priority={true}
            quality={100}
          />
        ) : (
          <div
            style={{
              width: 136,
              height: 136,
              backgroundColor: "#f0f0f0",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text c="dimmed" fz="lg">
              이미지 없음
            </Text>
          </div>
        )}
        <Stack align="center" gap={8}>
          <Title order={3} ta="center" c="dimmed">
            {title}
          </Title>

          <Text
            c="dimmed"
            fz="md"
            ta="center"
            style={{ whiteSpace: "pre-line" }}
          >
            {text}
          </Text>
        </Stack>
      </Stack>
    </Center>
  );
};

export default Empty;
