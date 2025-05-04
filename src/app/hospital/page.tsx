"use client";

import MobileLayout from "../../components/mantine/MobileLayout";
import { Text } from "@mantine/core";

const Hospital = () => {
  return (
    <MobileLayout
      showHeader={true}
      headerType="profile"
      title="병원 처방전"
      showBottomNav={true}
      currentRoute="/hospital"
    >
      <Text>모바일 전용화면 입니다.</Text>
    </MobileLayout>
  );
};

export default Hospital;
