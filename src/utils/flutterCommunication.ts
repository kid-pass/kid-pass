export const requestUserDataFromFlutter = () => {
  if (typeof window !== "undefined") {
    // Flutter 앱에 사용자 데이터 요청 이벤트 발생
    const event = new CustomEvent("request_user_data_from_web");
    window.dispatchEvent(event);
    console.log("Flutter에 사용자 데이터 요청을 보냈습니다.");
  }
};

export const sendMessageToFlutter = (type: string, data: any) => {
  if (typeof window !== "undefined") {
    // Flutter 앱에 메시지 전송
    const event = new CustomEvent("web_to_flutter_message", {
      detail: { type, data },
    });
    window.dispatchEvent(event);
    console.log(`Flutter에 메시지를 보냈습니다. 타입: ${type}`);
  }
};

// 테스트용 함수
export const triggerTestEvent = () => {
  if (typeof window !== "undefined") {
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

    // 전역 객체에 함수 추가 (콘솔에서 직접 호출 가능)
    (window as any).triggerFlutterEvent = triggerTestEvent;
  }
};
