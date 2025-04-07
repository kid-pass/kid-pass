import { useAuthStore } from "@/store/useAuthStore";

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
    // 토큰이 없으면 null 반환
    if (!token) {
      return null;
    }

    // JWT 토큰 만료 확인 (간단한 방법)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        // 토큰이 만료되었으면 갱신 시도
        return await refreshAccessToken();
      }

      return token;
    } catch (error) {
      console.error("토큰 검증 오류:", error);
      return await refreshAccessToken();
    }
  };

  // 현재 접속중인 아이번호 가져오기
  const getCrtChldNo = () => {
    if (crtChldrnNo) {
      return crtChldrnNo;
    }

    const stored = localStorage.getItem("kidlove");
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
    const response = await fetch("/api/auth/user", {
      headers: {
        Authorization: `Bearer ${token}`,
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
