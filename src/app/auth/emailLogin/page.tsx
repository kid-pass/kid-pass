"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Box,
  Group,
  LoadingOverlay,
  rem,
  AppShell,
} from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import MobileLayout from "@/components/mantine/MobileLayout";
import { useAuthStore } from "@/store/useAuthStore";

const LoginPage = () => {
  const router = useRouter();
  const { setToken, setRefreshToken, setUserInfo } = useAuthStore();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // React Native 웹뷰로 토큰 전송
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "token",
              token: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            })
          );
        } else {
          setToken(data.data.accessToken);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout
      showHeader={true}
      headerType="back"
      title="로그인"
      showBottomNav={false}
      onBack={() => router.replace("/auth/login")}
    >
      <Box pos="relative" px="md" style={{ height: "100%" }}>
        <LoadingOverlay visible={loading} />

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box mb="lg">
            <Text size="md" fw={500} mb={10}>
              이메일 아이디
            </Text>
            <TextInput
              placeholder="todayschild@mail.com"
              value={userId}
              onChange={(e) => setUserId(e.currentTarget.value)}
              size="md"
            />
          </Box>

          <Box mb="lg">
            <Text size="md" fw={500} mb={10}>
              비밀번호
            </Text>
            <PasswordInput
              placeholder="문자와 숫자를 포함한 8~20자"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              size="md"
              visibilityToggleIcon={({ reveal }) =>
                reveal ? (
                  <IconEye size={18} color="#888" />
                ) : (
                  <IconEyeOff size={18} color="#888" />
                )
              }
            />
          </Box>

          <Group gap={rem(15)} justify="center" mt={rem(24)}>
            <Text
              size="md"
              c="#aaa"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/auth/accountRecovery")}
            >
              계정 찾기
            </Text>
            <Text size="md" c="#aaa" style={{ textAlign: "center" }}>
              |
            </Text>
            <Text
              size="md"
              c="#aaa"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/auth/signup")}
            >
              회원가입
            </Text>
          </Group>

          <Box style={{ flex: 1 }} />

          <AppShell.Footer>
            <Box p="md">
              <Button
                type="submit"
                size="md"
                fullWidth
                color="blue"
                onClick={handleLogin}
              >
                로그인
              </Button>
            </Box>
          </AppShell.Footer>
        </form>
      </Box>
    </MobileLayout>
  );
};

export default LoginPage;
