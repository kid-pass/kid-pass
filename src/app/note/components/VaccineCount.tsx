'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Group, Text, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { VACCINE_LIST } from '../../../utils/vaccine';
import useChldrnListStore from '@/store/useChldrnListStore';
import { VacntnInfo } from '../page';

export interface VaccineStatusInfo {
	vaccineName: string;
	totalDoses: number;
	completedDoses: number;
	vaccineRecords: VacntnInfo[];
}

interface VaccineCountProps {
	vaccineStatusMap: Record<string, VaccineStatusInfo>;
}

const VaccineCount = ({ vaccineStatusMap = {} }: VaccineCountProps) => {
	const router = useRouter();
	const currentKid = useChldrnListStore((state) => state.currentKid);

	const handleVaccineClick = (vaccineId: number) => {
		router.push(`/note/detail/${vaccineId}?currentKid=${currentKid}`);
	};

	return (
		<Box
			pr="16"
			pl="16"
			mb="40"
			mt="16"
			style={{
				borderRadius: 10,
				boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.15)',
			}}
		>
			{VACCINE_LIST.map((vaccine) => {
				// 백엔드에서 제공한 상태 정보 사용
				const status = vaccineStatusMap[vaccine.id.toString()] || {
					totalDoses: 0,
					completedDoses: 0,
				};

				return (
					<Flex
						key={vaccine.id}
						align="center"
						pb="16"
						pt="16"
						onClick={() => handleVaccineClick(vaccine.id)}
						style={{
							borderBottom: '1px solid #f4f4f4',
							cursor: 'pointer',
						}}
					>
						<Box style={{ flex: 4 }}>
							<Text fw={700} size="md" c="#222222">
								{vaccine.name}
							</Text>
						</Box>

						<Group style={{ flex: 4 }} gap="xs">
							{Array.from(
								{ length: status.totalDoses },
								(_, i) => (
									<Box
										key={`${vaccine.id}-${i}`}
										w={rem(8)}
										h={rem(8)}
										bg={
											i < status.completedDoses
												? '#729bed'
												: '#d9d9d9'
										}
										style={{ borderRadius: '50%' }}
									/>
								)
							)}
						</Group>

						<IconChevronRight size={24} stroke={1.5} />
					</Flex>
				);
			})}
		</Box>
	);
};

export default VaccineCount;
