import React, { useEffect } from 'react';
import { Carousel } from '@mantine/carousel';
import { Box, Flex, Text, Image, Stack, Group } from '@mantine/core';
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
			slideSize="95%"
			slidesToScroll={1}
			dragFree={false}
			containScroll="keepSnaps"
			skipSnaps={false}
			loop={false}
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
					gap: '8px', // 슬라이드 간겨
				},
				slide: {
					flex: '0 0 auto',
					width: profiles.length > 1 ? 'calc(95% - 8px)' : '100%',
				},
			}}
		>
			{profiles.map((kidRecord) => {
				const { profile } = kidRecord;

				console.log(profile);
				const [physicalStats] = profile.chldrnInfoList;

				return (
					<Carousel.Slide key={profile.chldrnNo}>
						<Box
							style={{
								borderRadius: '8px',
							}}
							bg="brand.0"
							p="md"
							mb="xl"
						>
							<Flex justify="space-between" mb="md">
								<Stack gap="md">
									<ProfileMetrics
										label={`${profile.chldrnBrthdy?.substring(
											0,
											10
										)} 출생`}
										value={profile.chldrnNm}
									/>
									<ProfileMetrics
										label="나이 (만)"
										value={profile.age}
									/>
								</Stack>

								<Stack gap={8}>
									<Group align="center" gap={0}>
										<Text
											fz="sm"
											fw="500"
											c="#9e9e9e"
											onClick={() =>
												handleReport(profile.chldrnNo)
											}
										>
											리포트 업데이트
										</Text>
										<IconChevronRight
											size={24}
											color="#9E9E9E"
											stroke={1.5}
										/>
									</Group>
									<Flex align="end" justify="end">
										<Image
											src="https://heidimoon.cafe24.com/renwal/test2/barcode.png"
											width={76}
											height={76}
											alt="바코드"
										/>
									</Flex>
								</Stack>
							</Flex>

							<Flex align="center" justify="space-between">
								<ProfileMetrics
									label="몸무게"
									value={`${physicalStats.chldrnBdwgh}kg`}
								/>
								<ProfileMetrics
									label="키"
									value={`${physicalStats.chldrnHeight}cm`}
								/>
								<ProfileMetrics
									label="머리 둘레"
									value={`${physicalStats.chldrnHead}cm`}
								/>
							</Flex>
						</Box>
					</Carousel.Slide>
				);
			})}
		</Carousel>
	);
};

export default ProfileCarousel;
