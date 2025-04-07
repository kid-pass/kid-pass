import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '../styles/global.css';

const geistSans = localFont({
	src: [
		{
			path: './fonts/Pretendard-Thin.woff',
			weight: '100',
		},
		{
			path: './fonts/Pretendard-Light.woff',
			weight: '300',
		},
		{
			path: './fonts/Pretendard-Regular.woff',
			weight: '400',
		},
		{
			path: './fonts/Pretendard-Medium.woff',
			weight: '500',
		},
		{
			path: './fonts/Pretendard-SemiBold.woff',
			weight: '600',
		},
		{
			path: './fonts/Pretendard-Bold.woff',
			weight: '700',
		},
		{
			path: './fonts/Pretendard-Black.woff',
			weight: '900',
		},
	],
	variable: '--font-weight-regular',
});

// Mantine 테마 설정
const theme = createTheme({
	fontFamily: 'Pretendard, sans-serif',
	// 모바일 최적화 테마 설정
	breakpoints: {
		xss: '360px',
		xs: '36em', // 576px
		sm: '48em', // 768px
		md: '62em', // 992px
		lg: '75em', // 1200px
		xl: '88em', // 1408px
	},
	fontSizes: {
		xs: '0.5rem', // 8px
		sm: '0.75rem', // 12px
		md: '1rem', // 16px
		'md-lg': '1.125rem', //18px
		lg: '1.25rem', // 20px
		xl: '1.5rem', // 24px
	},
	spacing: {
		xxs: '0.25rem', // 4px
		xs: '0.5rem', // 8px
		sm: '0.75rem', // 12px
		md: '1rem', // 16px
		lg: '1.25rem', // 20px
		xl: '1.5rem', // 24px
	},
	components: {
		Text: {
			styles: {
				root: {
					// Text 컴포넌트의 기본 line-height 재정의
					lineHeight: '1',
				},
			},
		},
		Button: {
			defaultProps: {
				size: 'md', // 모바일에서 더 큰 터치 영역
			},
			styles: {
				root: {
					borderRadius: '28px',
					backgroundColor: '#729bed',
				},
			},
		},
		Input: {
			defaultProps: {
				size: 'md', // 모바일에서 입력하기 쉽도록 큰 사이즈
			},
			styles: {
				input: {
					borderRadius: '8px',
					height: '44px', // 모바일에서 터치하기 좋은 높이
				},
			},
		},
		Modal: {
			styles: {
				content: {
					borderRadius: '16px',
					padding: '16px',
				},
			},
		},
		Container: {
			defaultProps: {
				size: 'md',
				px: { base: 16, sm: 24, md: 32 }, // 반응형 패딩
			},
		},
	},
	defaultRadius: 'md',
	// 다크모드/라이트모드 컬러 스키마 관리
	colors: {
		brand: [
			'#EEF7FF', // 가장 밝은 색상
			'#eef3fc',
			'#dce7f9',
			'#c9dbf6',
			'#b6cff3',
			'#a3c3f0',
			'#90b7ed',
			'#729bed', // 기본 브랜드 색상
			'#5d7cbb',
			'#485e8a',
			'#334058', // 가장 어두운 색상
		],
	},
	primaryColor: 'brand',
	// 모바일에서 탭 인덱스와 포커스 스타일 개선
	focusRing: 'auto',
	// 시스템 다크모드 감지
	autoContrast: true,
	other: {
		// 커스텀 변수를 저장하는 공간
		fontColors: {
			primary: '#222222',
			sub1: '#646464',
			sub2: '#707070',
			sub3: '#9E9E9E',
			sub4: '#d9d9d9',
		},
	},
});

export const metadata: Metadata = {
	title: 'Kid Pass',
	description: 'Kid Pass Application',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${geistSans.variable}`}>
			<body>
				<MantineProvider theme={theme}>
					<ModalsProvider>
						<Notifications />
						{children}
					</ModalsProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
