import React, { useState } from 'react';
import { Carousel } from '@mantine/carousel';
import { Box, Flex, Text, Image, Stack, Divider } from '@mantine/core';
import { KidRecord } from './page';
import ProfileMetrics from '@/components/metrics/ProfileMetrics';
import { IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import QRGenerator from './QRGenerator';

interface ProfileCarouselProps {
	profiles: KidRecord[];
	onSlideChange: (index: number) => void;
}

const ProfileCarousel: React.FC<ProfileCarouselProps> = ({
	profiles,
	onSlideChange,
}) => {
	const router = useRouter();
	const { setCrtChldrnNo } = useAuthStore();
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	const handleReport = (chldrnNo: string) => {
		router.push(`/report?chldrnNo=${chldrnNo}`);
	};

	const handleSlideChange = (index: number) => {
		setCurrentSlideIndex(index);
		// 현재 슬라이드의 프로필 chldrnNo 설정
		if (profiles[index]) {
			const chldrnNo = profiles[index].profile.chldrnNo;
			setCrtChldrnNo(chldrnNo);
		}

		// 외부에서 전달된 onSlideChange 콜백도 호출
		if (onSlideChange) {
			onSlideChange(index);
		}
	};

	return (
		<Carousel
			slidesToScroll={1}
			dragFree={false}
			containScroll="keepSnaps"
			skipSnaps={false}
			loop={false}
			align="center" // 왼쪽 정렬
			onSlideChange={handleSlideChange}
			withControls={false}
			styles={{
				root: {
					width: '100%',
				},
				viewport: {
					overflow: 'hidden',
					width: '100%',
				},
				container: {
					display: 'flex',
					boxSizing: 'border-box',
					width: '100%',
					// container에는 패딩 없음
				},
				slide: {
					flex: '0 0 calc(100% - 40px)', // 슬라이드 간격까지 고려
					boxSizing: 'border-box',
				},
			}}
		>
			{profiles.map((kidRecord, index) => {
				const { profile } = kidRecord;
				const [physicalStats] = profile.chldrnInfoList;
				const isLastSlide = index === profiles.length - 1;
				const isFirstSlide = index === 0;
				const isOnlySlide = profiles.length === 1;

				// 슬라이드별 패딩 설정
				const slideStyle = isOnlySlide
					? { marginLeft: '20px', marginRight: '20px' }
					: isFirstSlide
					? { marginLeft: '20px', marginRight: '10px' }
					: isLastSlide
					? { marginRight: '20px' }
					: { marginRight: '10px' };

				return (
					<Carousel.Slide key={profile.chldrnNo} style={slideStyle}>
						<Box
							style={{
								borderRadius: '8px',
								position: 'relative',
							}}
							bg="brand.0"
							p="16 24"
							mb="xl"
						>
							<Box
								display="flex"
								style={{ flexDirection: 'column', gap: '19px' }}
							>
								<Box
									display="flex"
									style={{
										justifyContent: 'space-between',
										alignItems: 'start',
									}}
								>
									<ProfileMetrics
										label={`${profile.chldrnBrthdy?.substring(
											0,
											10
										)} 출생`}
										value={profile.chldrnNm}
									/>
									<Flex
										align="flex-start"
										justify="flex-end"
										gap={0}
										style={{
											position: 'relative',
											left: '8px',
										}}
									>
										<Text
											fz="sm"
											fw="500"
											c="#9e9e9e"
											onClick={() =>
												handleReport(profile.chldrnNo)
											}
										>
											리포트 상세보기
										</Text>
										<IconChevronRight
											size={16}
											color="#9E9E9E"
											stroke={1.5}
											style={{
												position: 'relative',
												top: '-3.5px',
											}}
										/>
									</Flex>
								</Box>

								<Stack gap={0}>
									<ProfileMetrics
										label="나이 (만)"
										value={profile.age}
									/>
								</Stack>
								<Flex align="center" justify="space-between">
									<ProfileMetrics
										label="몸무게"
										value={`${physicalStats.chldrnBdwgh}kg`}
									/>
									<Divider
										size="xs"
										color="#FFFFFF"
										orientation="vertical"
									/>
									<ProfileMetrics
										label="키"
										value={`${physicalStats.chldrnHeight}cm`}
									/>
									<Divider
										size="xs"
										color="#FFFFFF"
										orientation="vertical"
									/>
									<ProfileMetrics
										label="머리 둘레"
										value={`${physicalStats.chldrnHead}cm`}
									/>
								</Flex>
							</Box>
							<Box
								style={{
									position: 'absolute',
									top: '18%',
									right: '6%',
									borderRadius: '8px',
									background: '#FFFFFF',
								}}
							>
								<QRGenerator chldrnNo={profile.chldrnNo} />
							</Box>
						</Box>
					</Carousel.Slide>
				);
			})}
		</Carousel>
	);
};

export default ProfileCarousel;
