"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface FlutterTokenEvent extends Event {
  detail: {
    token: string;
    refreshToken?: string;
    crtChldrnNo?: string;
    userInfo?: {
      name: string;
      email: string;
      profileImage: string;
    };
  };
}

export default function FlutterTokenHandler() {
  const { setToken, setRefreshToken, setCrtChldrnNo, setUserInfo } =
    useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    setIsLoaded(true);

    // 테스트 이벤트 트리거 함수를 전역에 노출
    if (typeof window !== "undefined") {
      (window as any).triggerFlutterEvent = () => {
        const testEvent = new CustomEvent("flutter_data", {
          detail: {
            token: "test_token",
            refreshToken: "test_refresh_token",
            crtChldrnNo: "12345",
            userInfo: {
              name: "홍길동",
              email: "test@example.com",
              profileImage: "https://example.com/profile.jpg",
            },
          },
        });
        document.dispatchEvent(testEvent);
        console.log("테스트 이벤트가 발생되었습니다");
      };
    }

    const handleFlutterData = (event: Event) => {
      setLastMessage("이벤트 감지됨!");
      console.log("이벤트가 감지되었습니다:", event);
      const dataEvent = event as FlutterTokenEvent;
      const { token, refreshToken, crtChldrnNo, userInfo } = dataEvent.detail;

      // 상태 업데이트로 UI에 표시
      //   setLastMessage(
      //     JSON.stringify({ token, refreshToken, crtChldrnNo, userInfo }, null, 2)
      //   );

      // 토큰 저장
      if (token) {
        setToken(token);
      }

      // 리프레시 토큰 저장
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // 아동 번호 저장
      if (crtChldrnNo) {
        setCrtChldrnNo(crtChldrnNo);
      }

      // 사용자 정보 저장
      if (userInfo) {
        setUserInfo(userInfo);
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("flutter_data", handleFlutterData);

    // 디버깅: 이벤트 리스너가 등록되었는지 확인
    console.log("flutter_data 이벤트 리스너가 등록되었습니다");

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("flutter_data", handleFlutterData);
    };
  }, [setToken, setRefreshToken, setCrtChldrnNo, setUserInfo]);

  // 디버깅용 UI 요소 추가
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px",
          fontSize: "10px",
          maxWidth: "300px",
          maxHeight: "200px",
          overflow: "auto",
        }}
      >
        {lastMessage && <div>마지막 메시지: {lastMessage}</div>}
        <div>FlutterTokenHandler 로드됨: {isLoaded ? "예" : "아니오"}</div>
      </div>
    );
  }

  // 프로덕션에서는 UI 없음
  return null;
}
