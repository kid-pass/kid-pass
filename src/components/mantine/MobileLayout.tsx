import React, { useEffect, useState } from 'react';
import { AppShell, Box } from '@mantine/core';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

interface MobileLayoutProps {
	children: React.ReactNode;
	showHeader?: boolean;
	headerType?: 'back' | 'profile';
	title?: string;
	showBottomNav?: boolean;
	currentRoute?: string;
	onBack?: () => void;
	useWeekCarousel?: boolean;
	calendar?: boolean;
	useDatePicker?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
	children,
	showHeader = true,
	headerType = 'back',
	title = '',
	showBottomNav = true,
	currentRoute = '/',
	onBack,
	useWeekCarousel = false,
	calendar = false,
	useDatePicker = false,
}) => {
	// React Native 웹뷰 환경인지 확인
	const [isReactNativeWebView, setIsReactNativeWebView] = useState(true);

	useEffect(() => {
		// window.ReactNativeWebView가 존재하면 RN 웹뷰 환경으로 판단
		setIsReactNativeWebView(!!window.ReactNativeWebView);
	}, []);

	// RN 웹뷰 환경이면 하단 네비게이션 숨김, 아니면 showBottomNav 값 사용
	const forceShowBottomNav = isReactNativeWebView ? false : showBottomNav;

	return (
		<AppShell
			padding={0}
			header={
				showHeader ? { height: useWeekCarousel ? 156 : 60 } : undefined
			}
			footer={forceShowBottomNav ? { height: 60 } : undefined}
		>
			{showHeader && (
				<AppShell.Header
					styles={{
						header: {
							borderBottom: 'none',
						},
					}}
				>
					<Header
						type={headerType}
						title={title}
						onBack={onBack}
						useWeekCarousel={useWeekCarousel}
						calendar={calendar}
						useDatePicker={useDatePicker}
					/>
				</AppShell.Header>
			)}

			<AppShell.Main>
				<Box
					pt={showHeader ? 20 : 0}
					pb={forceShowBottomNav ? 60 : 0}
					style={
						{
							minHeight: '100%',
							lineHeight: 1,
							'--mantine-line-height-md': '1',
						} as React.CSSProperties
					}
				>
					{children}
				</Box>
			</AppShell.Main>

			{forceShowBottomNav && (
				<AppShell.Footer>
					<BottomNavigation currentRoute={currentRoute} />
				</AppShell.Footer>
			)}
		</AppShell>
	);
};

export default MobileLayout;
