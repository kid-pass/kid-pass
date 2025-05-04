import { useAuthStore } from "@/store/useAuthStore";
import { parseDate } from "react-datepicker/dist/date_utils";

const useAuth = () => {
  const {
    token,
    refreshToken,
    setToken,
    setRefreshToken,
    clearAll,
    crtChldrnNo,
    setCrtChldrnNo,
  } = useAuthStore();

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      clearAll();
      return null;
    }

    try {
      console.log("토큰 갱신 시도:", {
        refreshToken: refreshToken.substring(0, 10) + "...",
      });

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error("토큰 갱신 응답 오류:", response.status);
        clearAll();
        return null;
      }

      const data = await response.json();
      console.log("토큰 갱신 성공");

      if (data.accessToken) {
        setToken(data.accessToken);

        // 새로운 리프레시 토큰이 있으면 업데이트
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }

        // 토큰 설정 이벤트 발생
        const event = new CustomEvent("tokenSet");
        window.dispatchEvent(event);

        return data.accessToken;
      }

      return null;
    } catch (error) {
      console.error("토큰 갱신 오류:", error);
      clearAll();
      return null;
    }
  };

  const getToken = async () => {
    // 토큰이 없으면 로컬스토리지에서 토큰 가져오기
    if (!token) {
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        const parsedData = JSON.parse(stored);
        setToken(parsedData.state.token);
        return parsedData.state.token;
      }
    }

    return token;
  };

  // 현재 접속중인 아이번호 가져오기
  const getCrtChldNo = () => {
    if (crtChldrnNo) {
      return crtChldrnNo;
    }

    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsedData = JSON.parse(stored);
      // 수정: state 객체에서 crtChldrnNo 값만 추출
      const storedCurrentChldrnNo = parsedData.state.crtChldrnNo;
      if (storedCurrentChldrnNo && typeof storedCurrentChldrnNo === "string") {
        setCrtChldrnNo(storedCurrentChldrnNo);
        return storedCurrentChldrnNo;
      }
    }

    return null;
  };

  const getUserInfo = async () => {
    const currentToken = await getToken();

    if (!currentToken) {
      return null;
    }

    const response = await fetch("/api/auth/user", {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (response.ok) {
      const { user } = await response.json();
      return user;
    }

    return null;
  };
  return { getToken, getCrtChldNo, getUserInfo, refreshAccessToken };
};

export default useAuth;
