import React from 'react';
import { Carousel } from '@mantine/carousel';
import { Box, Flex, Text, Image, Stack, Divider } from '@mantine/core';
import { KidRecord } from './page';
import ProfileMetrics from '@/components/metrics/ProfileMetrics';
import { IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

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

	const handleReport = (chldrnNo: string) => {
		setCrtChldrnNo(chldrnNo);
		router.push(`/report?chldrnNo=${chldrnNo}`);
	};

	return (
		<Carousel
			slideSize="70%" // 각 슬라이드가 뷰포트의 90%를 차지
			slidesToScroll={1}
			dragFree={false}
			containScroll="keepSnaps"
			skipSnaps={false}
			loop={false}
			align="center" // 왼쪽 정렬
			onSlideChange={onSlideChange}
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

					width: '100%',
					// container에는 패딩 없음
				},
				slide: {
					flex: '0 0 92%',
					// 개별 슬라이드 스타일은 아래 map에서 처리
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
				const slidePadding = isOnlySlide
					? { padding: '0 16px' } // 슬라이드가 1개면 양쪽 패딩
					: isLastSlide
					? { padding: '0 16px 0 8px' } // 마지막 슬라이드
					: isFirstSlide
					? { padding: '0 8px 0 16px' }
					: { padding: '0 8px' }; // 그외 슬라이드

				return (
					<Carousel.Slide key={profile.chldrnNo} style={slidePadding}>
						<Box
							style={{
								borderRadius: '8px',
								position: 'relative',
							}}
							bg="brand.0"
							p="16 24"
							mb="xl"
						>
							<Stack>
								<Flex
									gap={18}
									justify="space-between"
									align="start"
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
								</Flex>

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
							</Stack>
							<Box
								style={{
									position: 'absolute',
									top: '23%',
									right: '6%',
									borderRadius: '8px',
									background: '#FFFFFF',
								}}
							>
								<Image
									src="https://heidimoon.cafe24.com/renwal/test2/barcode.png"
									width={64}
									height={64}
									alt="바코드"
								/>
							</Box>
						</Box>
					</Carousel.Slide>
				);
			})}
		</Carousel>
	);
};

export default ProfileCarousel;
