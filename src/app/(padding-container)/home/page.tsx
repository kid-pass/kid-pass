"use client";

import { Label } from "@/elements/label/Label";
import Button from "../../../elements/button/Button";
import sendToRn from "../../../utils/sendToRn";
import Container from "@/elements/container/Container";
import PlusIcon from "@/elements/svg/Plus";
import styles from "./home.module.css";
import { useEffect, useState } from "react";
import { MetricsSection } from "@/components/metrics/MetricsSection";
import Link from "next/link";
import ProfileCarousel from "./ProfileCarousel";
import useAuth from "@/hook/useAuth";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/bottomNavigation/BottomNavigation";
import instance from "../../../utils/axios";

type OpenStates = {
  sleep: boolean;
  meal: boolean;
  urination: boolean;
  temp: boolean;
};

interface PhysicalStats {
  chldrnBdwgh: number;
  chldrnHead: number;
  chldrnHeight: number;
  chldrnNo: number;
}

export interface KidProfile {
  age: number;
  atchCode: string;
  chldrnBrthdy?: string;
  chldrnInfoList: [PhysicalStats];
  chldrnNm: string;
  chldrnNo: number;
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

const App: React.FC = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [kidsData, setKidsData] = useState<KidRecord[]>([]);
  const [currentKidIndex, setCurrentKidIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();



      if (!token) {
        router.push("auth/login");
        return;
      }

      try {
        setLoading(true);
        console.log(token)
        const response = await instance.post(
          "authenticate/reissue",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true
          }
        );

        if (response.data?.data?.chldrnInfo) {
          const mockMetrics = (kidName: string, kidIndex: number) => [
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

          const kidsWithMetrics = response.data.data.chldrnInfo.map(
            (profile: KidProfile, index: number) => ({
              profile,
              metrics: mockMetrics(profile.chldrnNm, index),
            }),
          );

          setKidsData(kidsWithMetrics);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleMetric = (kidIndex: number, metricIndex: number) => {
    setKidsData((prevData) =>
      prevData.map((kid, idx) => {
        if (idx === kidIndex) {
          return {
            ...kid,
            metrics: kid.metrics.map((metric, mIdx) => {
              if (mIdx === metricIndex) {
                return {
                  ...metric,
                  isOpen: !metric.isOpen,
                };
              }
              return metric;
            }),
          };
        }
        return kid;
      }),
    );
  };

  const currentKid = kidsData[currentKidIndex];

  return (
    <>
      <Button label="Home" />
      <Button
        label="login"
        onClick={() => sendToRn({ type: "NAV", data: { uri: "auth" } })}
      />
      <div className="horizonFlexbox align-center space-between">
        <Label text="오늘의아이" css="Logo" />
        <img src="https://heidimoon.cafe24.com/renwal/test2/Bell.svg" />
      </div>

      <ProfileCarousel
        profiles={kidsData}
        isLoading={loading}
        onSlideChange={setCurrentKidIndex}
      />

      <Container className="homepage_1 gap-4">
        <PlusIcon color="#FFFFFF" size={12} strokeWidth={4} />
        <Label text="오늘의 아이 증상 기록하기" css="home_1" />
        <img
          className={styles.homepage_image_1}
          src="https://heidimoon.cafe24.com/renwal/test2/Frame%2039.png"
        />
      </Container>

      <div className="horizonFlexbox gap-16 align-center">
        <Container className="homepage_2">
          <Link
            href={"/map"}
            className="verticalFlexbox justify-center"
          >
            <Label text="지금 문 연" css="home_2" />
            <Label text="병원/약국" css="home_2" />
          </Link>
          <img src="https://heidimoon.cafe24.com/renwal/test2/Group.png" />
        </Container>
        <Container className="homepage_2">
          <div className="verticalFlexbox justify-center">
            <Label text="진료받은" css="home_2" />
            <Label text="기록" css="home_2" />
          </div>
          <img src="https://heidimoon.cafe24.com/renwal/test2/OBJECTS.png" />
        </Container>
      </div>

      {currentKid && (
        <MetricsSection
          labelText={`오늘의 ${currentKid.profile.chldrnNm} 기록이에요`}
          metricsData={currentKid.metrics}
        />
      )}
      <BottomNavigation />
    </>
  );
};

export default App;