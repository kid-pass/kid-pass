import { useAuthStore } from "@/store/useAuthStore";

const useAuth = () => {
  const { token, setToken, crtChldrnNo, setCrtChldrnNo } = useAuthStore();

  const getToken = async () => {
    // 1. 먼저 Zustand store 확인
    if (token) {
      return token;
    }

    // 2. store에 없으면 localStorage 확인
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("kidlove");
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          const storedToken = parsedData.state.accessToken;
          const storedRefreshToken = parsedData.state.refreshToken;

          if (!storedToken) {
            return null;
          }

          // 토큰 검증
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            setToken(storedToken);
            return storedToken;
          } else {
            // 토큰이 만료되었다면 리프레시 토큰으로 새로운 액세스 토큰 발급
            const refreshResponse = await fetch("/api/auth/refresh", {
              headers: {
                Authorization: `Bearer ${storedRefreshToken}`,
              },
            });

            if (refreshResponse.ok) {
              const { accessToken: newAccessToken } =
                await refreshResponse.json();
              setToken(newAccessToken);
              return newAccessToken;
            }
          }
        } catch (error) {
          return null;
        }
      }
    }

    return null;
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

  return { getToken, getCrtChldNo, getUserInfo };
};

export default useAuth;
