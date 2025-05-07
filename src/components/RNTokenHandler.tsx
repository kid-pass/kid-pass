'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface RNTokenEvent extends MessageEvent {
	data: {
		type: string;
		token: string;
		refreshToken?: string;
		userInfo?: {
			name: string;
			email: string;
			profileImage: string;
		};
	};
}

export default function RNTokenHandler() {
	const { setToken, setRefreshToken, setUserInfo } = useAuthStore();
	const [isLoaded, setIsLoaded] = useState(false);
	const [lastMessage, setLastMessage] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
		// React Native 웹뷰로부터의 메시지 처리
		const handleRNMessage = (event: MessageEvent) => {
			try {
				setLastMessage('메시지 수신됨!');

				// 데이터 형식 확인 및 처리
				let data;
				if (typeof event.data === 'string') {
					try {
						data = JSON.parse(event.data);
					} catch (e) {
						setLastMessage(
							'JSON 파싱 실패: ' + event.data.substring(0, 50)
						);
						return;
					}
				} else {
					data = event.data;
				}

				setMessage(JSON.stringify(data).substring(0, 100));

				// 토큰 메시지 처리
				if (data.type === 'token') {
					setIsLoaded(true);

					// 토큰 저장
					if (data.token) {
						setToken(data.token);

						// 토큰이 설정되면 이벤트 발생
						const tokenSetEvent = new CustomEvent('tokenSet', {
							detail: { token: data.token },
						});
						window.dispatchEvent(tokenSetEvent);
					}

					// 리프레시 토큰 저장
					if (data.refreshToken) {
						setRefreshToken(data.refreshToken);
					}

					// 사용자 정보 저장
					if (data.userInfo) {
						setUserInfo(data.userInfo);
					}
				}
			} catch (error) {
				console.error('메시지 처리 오류:', error);
				setLastMessage(
					'메시지 처리 중 오류: ' + (error as Error).message
				);
			}
		};

		// 메시지 이벤트 리스너 등록
		setMessage('메시지 리스너 등록됨');
		setLastMessage('리스너 대기 중...');

		window.addEventListener('message', handleRNMessage);

		console.log('RNTokenHandler: 메시지 리스너 등록됨');

		// 컴포넌트 언마운트 시 이벤트 리스너 제거
		return () => {
			window.removeEventListener('message', handleRNMessage);
		};
	}, [setToken, setRefreshToken, setUserInfo]);

	// 개발 환경에서만 디버깅 UI 표시
	if (process.env.NODE_ENV === 'development') {
		return (
			<div
			// style={{
			//   position: "fixed",
			//   bottom: 0,
			//   left: 0,
			//   zIndex: 9999,
			//   background: "rgba(0,0,0,0.7)",
			//   color: "white",
			//   padding: "8px",
			//   fontSize: "14px",
			//   maxWidth: "300px",
			//   maxHeight: "200px",
			//   overflow: "auto",
			// }}
			>
				{/* <div>마지막 메시지: {lastMessage || "없음"}</div>
        <div>RNTokenHandler 로드됨: {isLoaded ? "예" : "아니오"}</div>
        <div>
          메시지:{" "}
          {typeof message === "object" ? JSON.stringify(message) : message}
        </div> */}
			</div>
		);
	}

	// 프로덕션에서는 UI 없음
	return null;
}
