"use client";

import { Box, Stack, Text, Button, Group, Loader } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import MobileLayout from "@/components/mantine/MobileLayout";
import Image from "next/image";
import { useViewportSize } from "@mantine/hooks";
import { KakaoLoginProvider } from "../kakao";
import { GoogleLoginProvider } from "../google";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { notifications } from "@mantine/notifications";
import { firebaseConfig } from "../useAuthSocial";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { height } = useViewportSize();
  const { setAccessToken, setRefreshToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 소셜 로그인 provider 초기화
  const kakaoProvider = new KakaoLoginProvider(
    process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!
  );
  const googleProvider = new GoogleLoginProvider(firebaseConfig);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setIsKakaoLoading(true);
      handleKakaoCallback(code);
      // URL에서 code 파라미터 제거
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // 구글 리다이렉트 결과 확인
    const checkGoogleRedirect = async () => {
      try {
        await googleProvider.initialize();

        const result = await googleProvider.getRedirectResult();

        if (result) {
          setIsGoogleLoading(true);
          await handleSocialLogin("google", result.user);
          setIsGoogleLoading(false);
        }
      } catch (error) {
        console.error("구글 로그인 에러:", error);
        setIsGoogleLoading(false);
      }
    };

    checkGoogleRedirect();
  }, [searchParams]);

  const handleSocialLogin = async (provider: string, user: any) => {
    try {
      // 서버에 소셜 로그인 인증 요청
      const response = await fetch("/api/auth/social-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          user,
        }),
      });

      if (!response.ok) {
        throw new Error(`${provider} 로그인 실패`);
      }

      const data = await response.json();
      console.log("소셜 로그인 응답:", data); // 응답 구조 확인

      // 토큰 저장 및 리다이렉트
      if (data.data.accessToken) {
        setAccessToken(data.data.accessToken);

        // refreshToken이 있는지 확인하고 저장
        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken);
          document.cookie = `refreshToken=${
            data.data.refreshToken
          }; path=/; max-age=${7 * 24 * 60 * 60}; secure`;
        }

        notifications.show({
          title: "로그인 성공",
          message: "환영합니다!",
          color: "green",
        });

        router.push("/home");
        return true;
      } else {
        throw new Error("토큰이 없습니다.");
      }
    } catch (error) {
      console.error(`${provider} 로그인 에러:`, error);
      notifications.show({
        title: "로그인 실패",
        message: "로그인에 실패했습니다. 다시 시도해주세요.",
        color: "red",
      });
      return false;
    }
  };

  const handleKakaoCallback = async (code: string) => {
    try {
      // 인가 코드로 토큰 받기
      const result = await kakaoProvider.handleRedirect(code);
      if (!result) {
        throw new Error("카카오 로그인 실패");
      }

      await handleSocialLogin("kakao", result.user);
    } catch (error) {
      console.error("카카오 로그인 에러:", error);
      notifications.show({
        title: "로그인 실패",
        message: "로그인에 실패했습니다. 다시 시도해주세요.",
        color: "red",
      });
    } finally {
      setIsKakaoLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      await kakaoProvider.loginWithRedirect();
    } catch (error) {
      console.error("카카오 로그인 에러:", error);
      notifications.show({
        title: "로그인 실패",
        message: "로그인에 실패했습니다. 다시 시도해주세요.",
        color: "red",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await googleProvider.initialize();

      // 팝업 방식으로 시도
      const result = await googleProvider.loginWithPopup();

      if (result) {
        await handleSocialLogin("google", result.user);
      }
    } catch (error) {
      notifications.show({
        title: "로그인 실패",
        message: "로그인에 실패했습니다. 다시 시도해주세요.",
        color: "red",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <MobileLayout
      showHeader={false}
      headerType="back"
      title="로그인"
      showBottomNav={false}
      onBack={handleBack}
    >
      {(isKakaoLoading || isGoogleLoading) && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Stack align="center">
            <Loader size="lg" />
            <Text>로그인 중...</Text>
          </Stack>
        </Box>
      )}

      <Box
        p="md"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          height: height,
        }}
      >
        <Box>
          <Text fz={24} fw={600} ta="center">
            아이가 아픈 이유가 뭘까요?
          </Text>
          <Text
            c="dimmed"
            ta="center"
            mt="sm"
            style={{ whiteSpace: "pre-line" }}
          >
            날씨처럼 하루하루가 다른{"\n"}
            아이의 정확한 증상을 알고싶은{"\n"}
            엄마들에게 도움이 되고싶어요.
          </Text>
        </Box>
        <Stack gap="xl">
          <Stack gap="md" mt={40}>
            <Button
              variant="filled"
              bg="#FEE500"
              leftSection={
                isLoading ? (
                  <Loader size="sm" color="dark" />
                ) : (
                  <Image
                    src="/images/kakao.icon.png"
                    alt="카카오 로그인"
                    width={20}
                    height={20}
                    style={{ objectFit: "contain" }}
                  />
                )
              }
              fullWidth
              onClick={handleKakaoLogin}
              disabled={isLoading || isKakaoLoading || isGoogleLoading}
            >
              {isLoading ? "로그인 중..." : "카카오로 계속하기"}
            </Button>

            <Button
              variant="filled"
              bg="#000000"
              leftSection={
                <Image
                  src="/images/apple.icon.png"
                  alt="애플 로그인"
                  width={20}
                  height={20}
                  style={{ objectFit: "contain" }}
                />
              }
              fullWidth
              c="white"
              onClick={() => {}}
            >
              Apple로 계속하기
            </Button>

            <Button
              variant="filled"
              bg="#F2F2F2"
              leftSection={
                isGoogleLoading ? (
                  <Loader size="sm" color="dark" />
                ) : (
                  <Image
                    src="/images/google.icon.png"
                    alt="구글 로그인"
                    width={20}
                    height={20}
                    style={{ objectFit: "contain" }}
                  />
                )
              }
              fullWidth
              onClick={handleGoogleLogin}
              disabled={isLoading || isKakaoLoading || isGoogleLoading}
            >
              {isGoogleLoading ? "로그인 중..." : "Google로 계속하기"}
            </Button>
          </Stack>

          <Group justify="center" gap={4}>
            <Button
              variant="filled"
              bg="white"
              c="black"
              size="sm"
              onClick={() => router.push("/auth/emailLogin")}
            >
              이메일로 계속하기
            </Button>
          </Group>
        </Stack>
      </Box>
    </MobileLayout>
  );
};

export default LoginPage;
