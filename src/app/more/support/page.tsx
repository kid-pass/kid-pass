"use client";

import MobileLayout from "@/components/mantine/MobileLayout";
import {
  Container,
  Stack,
  Text,
  Box,
  rem,
  TextInput,
  Textarea,
  Button,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import useNavigation from "@/hook/useNavigation";
import useAuth from "@/hook/useAuth";

const SupportPage = () => {
  const router = useRouter();
  const { goBack } = useNavigation();
  const { getToken, getUserInfo } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user info when component mounts
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo) {
          setName(userInfo.name || "");
          setEmail(userInfo.email || "");
        }
      } catch (error) {
        console.error("Failed to load user info:", error);
      }
    };

    loadUserInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      notifications.show({
        title: "입력 오류",
        message: "모든 필드를 입력해주세요",
        color: "red",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const accessToken = await getToken();

      const response = await fetch("/api/support/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("문의 제출에 실패했습니다");
      }

      notifications.show({
        title: "성공",
        message: "문의가 성공적으로 제출되었습니다",
        color: "green",
      });

      // Clear form
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("문의 제출 오류:", error);
      notifications.show({
        title: "오류",
        message: "문의 제출에 실패했습니다. 다시 시도해주세요",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout
      showHeader={true}
      headerType="back"
      title="고객 지원"
      currentRoute="/more/support"
      onBack={goBack}
    >
      <Container
        p={0}
        h="100%"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box p={rem(16)}>
          <Text size={rem(16)} fw={600} mb={rem(16)}>
            문의하기
          </Text>

          <Text size={rem(14)} c="dimmed" mb={rem(24)}>
            질문이나 문제가 있으신가요? 아래 양식을 작성하시면 최대한 빨리
            답변드리겠습니다.
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap={rem(16)}>
              <TextInput
                label="이름"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <TextInput
                label="이메일"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
              />

              <TextInput
                label="제목"
                placeholder="문의 제목을 입력하세요"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <Textarea
                label="내용"
                placeholder="문의 내용을 자세히 입력해주세요"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minRows={5}
              />

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                style={{
                  marginTop: rem(16),
                }}
              >
                제출하기
              </Button>
            </Stack>
          </form>

          <Box mt={rem(32)}>
            <Text size={rem(16)} fw={600} mb={rem(16)}>
              자주 묻는 질문
            </Text>

            <Stack gap={rem(16)}>
              <FaqItem
                question="Kid Pass는 어떤 서비스인가요?"
                answer="Kid Pass는 아이의 건강 기록을 관리하고 병원 방문 내역을 추적할 수 있는 서비스입니다. 성장 기록, 예방접종 일정, 병원 방문 내역 등을 한 곳에서 관리할 수 있습니다."
              />

              <FaqItem
                question="계정 정보를 변경하려면 어떻게 해야 하나요?"
                answer="프로필 관리 메뉴에서 계정 정보를 변경할 수 있습니다. 더보기 > 프로필 관리에서 이름, 이메일 등의 정보를 수정할 수 있습니다."
              />

              <FaqItem
                question="아이 정보는 어떻게 추가하나요?"
                answer="홈 화면에서 '아이 추가하기' 버튼을 클릭하여 새로운 아이 프로필을 생성할 수 있습니다. 이름, 생년월일, 성별 등의 정보를 입력하면 됩니다."
              />

              <FaqItem
                question="데이터는 안전하게 보관되나요?"
                answer="네, Kid Pass는 사용자의 개인정보와 아이의 건강 데이터를 안전하게 보호하기 위해 최신 보안 기술을 사용합니다. 자세한 내용은 개인정보처리방침을 참고해주세요."
              />
            </Stack>
          </Box>
        </Box>
      </Container>
    </MobileLayout>
  );
};

// FAQ 아이템 컴포넌트
const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box
      p={rem(16)}
      style={{
        backgroundColor: "white",
        borderRadius: rem(8),
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Text size={rem(14)} fw={500}>
          {question}
        </Text>
        <Text>{isOpen ? "−" : "+"}</Text>
      </Box>

      {isOpen && (
        <Text size={rem(14)} mt={rem(8)} c="dimmed">
          {answer}
        </Text>
      )}
    </Box>
  );
};

export default SupportPage;
