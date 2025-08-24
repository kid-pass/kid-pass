import React, { useState } from 'react';
import {
	Flex,
	Title,
	ActionIcon,
	Box,
	Popover,
	Button,
	Modal,
	Avatar,
} from '@mantine/core';
import {
	IconChevronLeft,
	IconCalendar,
	IconUserCircle,
} from '@tabler/icons-react';
import WeeklyDatePicker from '@/components/datePicker/WeekCarousel';
import useCurrentDateStore from '@/store/useCurrentDateStore';
import { useAuthStore } from '@/store/useAuthStore';
import useChldrnListStore from '@/store/useChldrnListStore';
import dayjs from 'dayjs';
import KidsList, { KidData } from './KidsList';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@mantine/dates';

interface HeaderProps {
	type: 'back' | 'profile';
	title?: string;
	onBack?: () => void;
	useWeekCarousel?: boolean;
	calendar?: boolean;
	useDatePicker?: boolean;
}

const Header: React.FC<HeaderProps> = ({
	type,
	title,
	onBack,
	useWeekCarousel,
	calendar,
	useDatePicker,
}) => {
	const { currentDate, setCurrentDate } = useCurrentDateStore();
	const { crtChldrnNo } = useAuthStore(); // 현재 선택된 아이의 ID
	const { children } = useChldrnListStore(); // 아이 목록
	const router = useRouter();
	const [kids, setKids] = useState<KidData[]>();
	const [showDatePicker, setShowDatePicker] = useState(false);

	// 현재 선택된 아이의 프로필 이미지 URL 가져오기
	const currentChildProfileImage = children.find(
		(child) => child.chldrnNo === crtChldrnNo
	)?.profileImageUrl;

	if (type === 'back') {
		return (
			<Flex
				h={60}
				px="md"
				align="center"
				justify="space-between"
				style={{
					borderBottom: '1px solid var(--mantine-color-gray-2)',
				}}
			>
				<ActionIcon onClick={onBack} size="lg" bg="transparent">
					<IconChevronLeft stroke={2} />
				</ActionIcon>
				<Title
					order={4}
					style={{
						position: 'absolute',
						left: '50%',
						transform: 'translateX(-50%) translateY(10%)',
					}}
				>
					{title}
				</Title>
				<Box w={44}></Box>
			</Flex>
		);
	}

	if (type === 'profile') {
		return (
			<Box>
				<Flex h={60} px="md" align="center" justify="space-between">
					<Flex align="flex-end">
						<Title order={3}>{currentDate.format('M월 D일')}</Title>

						{currentDate.format('M월 D일') ===
							dayjs().format('M월 D일') && (
							<Title order={3}>, 오늘</Title>
						)}
					</Flex>
					<Flex align="center" gap={4}>
						{calendar && (
							<Button
								size="md"
								styles={{
									root: {
										backgroundColor: 'white',
										padding: '0',
										border: 'none',

										borderRadius: '0',
									},
								}}
								onClick={() => router.push('/note/calendar')}
							>
								<IconCalendar color="#729BED" size={20} />
							</Button>
						)}
						{useDatePicker && (
							<>
								<Button
									size="md"
									styles={{
										root: {
											backgroundColor: 'white',
											padding: '0',
											border: 'none',

											borderRadius: '0',
										},
									}}
									onClick={() =>
										setShowDatePicker((prev) => !prev)
									}
								>
									<IconCalendar color="#729BED" size={20} />
								</Button>
								{showDatePicker && (
									<Modal
										opened={showDatePicker}
										onClose={() => setShowDatePicker(false)}
										size="sm"
										centered
										styles={{
											header: {
												display: 'none',
											},
											body: {
												justifyContent: 'center',
												display: 'flex',
											},
										}}
									>
										<DatePicker
											value={currentDate.toDate()}
											onChange={(date) =>
												setCurrentDate(dayjs(date))
											}
										/>
									</Modal>
								)}
							</>
						)}
						<Popover>
							<Popover.Target>
								{currentChildProfileImage ? (
									<Avatar
										src={currentChildProfileImage}
										alt="프로필 이미지"
										size={20}
										radius="xl"
									/>
								) : (
									<IconUserCircle size={20} color="#729BED" />
								)}
							</Popover.Target>
							<Popover.Dropdown>
								<KidsList />
							</Popover.Dropdown>
						</Popover>
					</Flex>
				</Flex>

				{useWeekCarousel && (
					<WeeklyDatePicker
						currentDate={currentDate}
						onSelect={setCurrentDate}
					/>
				)}
			</Box>
		);
	}

	return null;
};

export default Header;
