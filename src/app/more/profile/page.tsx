'use client';

import { useRef, useState, useEffect } from 'react';
import MobileLayout from '@/components/mantine/MobileLayout';
import useChldrnListStore from '@/store/useChldrnListStore';
import instance from '@/utils/axios';
import {
	Box,
	Image,
	LoadingOverlay,
	Text,
	useMantineTheme,
} from '@mantine/core';

// heic2any 라이브러리를 정적으로 가져오지 않음

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
	const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);

	// 이미지 클릭 시 해당 아이의 ID를 저장하고 파일 선택 창 열기
	const handleImageClick = (childId: string) => {
		setSelectedChildId(childId);
		inputFileRef.current?.click();
	};

	const handleFileChange = async (event: any) => {
		let file = event.target.files?.[0];
		if (!file || !selectedChildId) return;

		setIsUploading(true);

		try {
			if (
				file.type === 'image/heic' ||
				file.name.toLowerCase().endsWith('.heic')
			) {
				console.log('HEIC 파일 변환 시작');
				// 동적으로 heic2any 라이브러리 가져오기
				const heic2any = (await import('heic2any')).default;
				const convertedBlob = await heic2any({
					blob: file,
					toType: 'image/jpeg',
					quality: 0.8,
				});

				file = new File(
					[convertedBlob as Blob],
					file.name.replace(/\.heic$/i, '.jpg'),
					{ type: 'image/jpeg' }
				);
				console.log('HEIC 파일 변환 완료:', file.name);
			}

			const formData = new FormData();
			formData.append('file', file);
			formData.append('childId', selectedChildId);
			formData.append('filePrefix', 'profileImage');

			const response = await instance.post('/image/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			const data = response.data;

			if (data.success && data.imageUrl) {
				if (selectedChildId) {
					updateChild(selectedChildId, {
						profileImageUrl: data.imageUrl,
					});
				}
			}
		} catch (error) {
			console.error('이미지 업로드 오류:', error);
		} finally {
			setIsUploading(false);
			setSelectedChildId(null);
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
							position: 'relative', // 로딩 오버레이를 위한 position 설정
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
						{isUploading && selectedChildId === child.chldrnNo && (
							<LoadingOverlay visible={isUploading} />
						)}
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
								w="88"
								h="88"
								onClick={() => handleImageClick(child.chldrnNo)}
								style={{
									borderRadius: '100%',
									objectFit: 'cover',
									flex: '0 0 88px', // flex-grow:0, flex-shrink:0, flex-basis:88px
									minWidth: '88px',
									minHeight: '88px',
								}}
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
