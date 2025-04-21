'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import useChldrnListStore from '@/store/useChldrnListStore';
import instance from '@/utils/axios';
import { Box, Image, Text, useMantineTheme } from '@mantine/core';
import { PutBlobResult } from '@vercel/blob';
import { useRef, useState } from 'react';

const childrenOrder = [
	'첫째',
	'둘째',
	'셋째',
	'넷째',
	'다섯째',
	'여섯째',
	'일곱째',
	'여덟째',
	'아홉째',
	'열째',
];

const App = () => {
	const theme = useMantineTheme();
	const { children, updateChild } = useChldrnListStore();
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [blob, setBlob] = useState<PutBlobResult | null>(null);

	// 이미지 클릭 시 파일 선택 창 열기
	const handleImageClick = () => {
		inputFileRef.current?.click();
	};

	const handleFileChange = async (event: any) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// FormData 객체 생성
		const formData = new FormData();
		formData.append('file', file);

		// Axios로 요청 보내기
		try {
			const response = await instance.post('/image/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			const newBlob = response.data as PutBlobResult;
		} catch (error) {
			console.error('이미지 업로드 오류:', error);
		}
	};

	return (
		<MobileLayout
			title="프로필 관리"
			headerType="back"
			currentRoute="/more/profile"
		>
			<input
				type="file"
				ref={inputFileRef}
				style={{ display: 'none' }}
				accept="image/*"
				onChange={handleFileChange}
			/>

			<Box
				display="flex"
				px={theme.spacing.md}
				style={{
					flexDirection: 'column',
					gap: `${theme.spacing.md}`,
				}}
			>
				{children.map((child, index) => (
					<Box
						w="100%"
						style={{
							borderRadius: `${theme.radius.md}`,
							justifyContent: 'space-between',
							padding: `${theme.spacing.md}`,
						}}
						bg={
							child.chldrnSexdstn === 'M'
								? theme.colors.brand[0]
								: child.chldrnSexdstn === 'F'
								? theme.colors.brand[11]
								: 'fallbackColor'
						}
						display="flex"
						key={child.chldrnNo}
					>
						<Box
							display="flex"
							style={{ alignItems: 'center', gap: '12px' }}
						>
							<Image
								src={
									child.profileImageUrl === null
										? '/profile.png'
										: child.profileImageUrl
								}
								w="88px"
								height="88px"
								onClick={handleImageClick}
							/>
							<Box
								display="flex"
								style={{
									flexDirection: 'column',
									alignItems: 'flex-start',
									gap: '4px',
								}}
							>
								<Text
									c={theme.other.fontColors.sub1}
									fz={theme.fontSizes.sm}
									fw={400}
								>
									{`${child.birthDate?.substring(
										0,
										10
									)} 출생`}
								</Text>
								<Box
									display="flex"
									style={{
										gap: '4px',
										justifyContent: 'flex-start',
									}}
								>
									<Text
										c={theme.other.fontColors.primary}
										fz={theme.fontSizes.lg}
										fw={600}
									>
										{child.chldrnNm}
									</Text>
									{child.chldrnSexdstn === 'M' ? (
										<Image
											src="/boySign.png"
											w="20"
											h="20"
										/>
									) : (
										<Image
											src="/girlSign.png"
											w="20"
											h="20"
										/>
									)}
								</Box>
							</Box>
						</Box>
						<Box
							display="flex"
							style={{
								flexDirection: 'column',
								justifyContent: 'space-between',
							}}
						>
							<Box
								p="4px 14px"
								c="#BFBFBF"
								fz={theme.fontSizes.sm}
								fw="500"
								style={{
									borderRadius: '25px',
									border: '1px solid #BFBFBF',
									textAlign: 'center',
								}}
							>
								{childrenOrder[index]}
							</Box>
							<Text
								c={theme.other.fontColors.sub1}
								fz={theme.fontSizes.sm}
								fw={400}
							>
								프로필 수정
							</Text>
						</Box>
					</Box>
				))}
			</Box>
		</MobileLayout>
	);
};

export default App;
