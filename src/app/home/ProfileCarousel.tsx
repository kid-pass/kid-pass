import React from 'react';
import { Carousel } from '@mantine/carousel';
import { Box, Flex, Text, Image, Stack, Group, Divider } from '@mantine/core';
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
			slideSize="calc(100% - 32px)" // 간격을 고려한 슬라이드 크기 조정
			slidesToScroll={1}
			dragFree={false}
			containScroll="keepSnaps"
			skipSnaps={false}
			loop={false}
			onSlideChange={onSlideChange}
			withControls={false}
			styles={{
				root: {
					width: '97%',
				},
				viewport: {
					width: '100%',
				},
				container: {
					display: 'flex',
					width: '100%',
					gap: '16px',
					padding: '0 16px',
				},
				slide: {
					flex: '0 0 auto',
					width: '100%', // 단순화된 너비 설정
				},
			}}
		>
			{profiles.map((kidRecord) => {
				const { profile } = kidRecord;
				const [physicalStats] = profile.chldrnInfoList;

				return (
					<Carousel.Slide key={profile.chldrnNo}>
						<Box
							style={{
								borderRadius: '8px',
							}}
							bg="brand.0"
							p="16 24"
							mb="xl"
						>
							<Flex justify="space-between" mb="md">
								<Stack gap={18}>
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

								<Stack gap={0}>
									<Group align="center" gap={0}>
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
					</Carousel.Slide>
				);
			})}
		</Carousel>
	);
};

export default ProfileCarousel;
