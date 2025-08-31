"use client";

import MobileLayout from "@/components/mantine/MobileLayout";
import { Suspense } from "react";
import useNavigation from "@/hook/useNavigation";
import ReportContent from "./ReportContent";

const App = () => {
  const { goBack } = useNavigation();

  return (
    <MobileLayout
      showHeader={true}
      headerType="back"
      title="리포트 상세보기1"
      onBack={goBack}
      showBottomNav={true}
    >
      <Suspense fallback={<div>로딩 중...</div>}>
        <ReportContent />
      </Suspense>
    </MobileLayout>
  );
};

export default App;
