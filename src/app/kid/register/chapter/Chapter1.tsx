'use client';

import React from 'react';
import { useChldrnInfoStore } from '@/store/useChldrnInfoStore';
import { ChapterProps } from '@/hook/useChapter';
import Spacer from '@/elements/spacer/Spacer';
import {
	Grid,
	Flex,
	Text,
	useMantineTheme,
	Image,
	Stack,
	Box,
} from '@mantine/core';

const Item = ({
	children,
	index,
	handleAgeSelection,
	theme,
}: {
	children: React.ReactNode;
	index: number;
	handleAgeSelection: (index: number) => void;
	theme: any; // MantineTheme 타입 사용 권장
}) => (
	<Flex
		direction="column"
		justify="center"
		align="center"
		bg="#ffffff"
		gap={24}
		styles={{
			root: {
				border: `1px solid ${theme.colors[theme.primaryColor][6]}`,
			},
		}}
		style={{ borderRadius: '10px' }}
		ta="center"
		lh={1.2}
		p="40px 0 16px 0"
		onClick={() => handleAgeSelection(index)}
	>
		{children}
	</Flex>
);

const Chapter1: React.FC<ChapterProps> = ({ onNext }) => {
	const setAge = useChldrnInfoStore((state) => state.setAge);
	const ageTypes = ['NWNBB', 'BABY', 'INFANT', 'CHILD'] as const;
	const theme = useMantineTheme();

	const texts = [
		<>
			<Box w={40} h={72}>
				<Image
					src="/images/nwnbb.png"
					alt="신생아"
					style={{
						width: '100%',
						height: '100%',
					}}
				/>
			</Box>

			<Stack gap={8}>
				<Text
					fz={theme.fontSizes.mdLg}
					fw={700}
					c={theme.colors[theme.primaryColor][6]}
				>
					신생아
				</Text>
				<Text fz="md" fw={400} c="#9E9E9E">
					(태아 ~ 1개월)
				</Text>
			</Stack>
		</>,
		<>
			<Box w={40} h={72}>
				<Image
					src="/images/baby.png"
					style={{ width: '100%', height: '100%' }}
					alt="영아"
				/>
			</Box>
			<Stack gap={8}>
				<Text
					fz={theme.fontSizes.mdLg}
					fw={700}
					c={theme.colors[theme.primaryColor][6]}
				>
					영아
				</Text>
				<Text fz="md" fw={400} c="#9E9E9E">
					(1개월 ~ 1년)
				</Text>
			</Stack>
		</>,
		<>
			<Box w={40} h={72}>
				<Image
					src="/images/infant.png"
					style={{ width: '100%', height: '100%' }}
					alt="유아"
				/>
			</Box>
			<Stack gap={8}>
				<Text
					fz={theme.fontSizes.mdLg}
					fw={700}
					c={theme.colors[theme.primaryColor][6]}
				>
					유아
				</Text>
				<Text fz="md" fw={400} c="#9E9E9E">
					(1년 ~ 6년)
				</Text>
			</Stack>
		</>,
		<>
			<Box w={40} h={72}>
				<Image
					src="/images/child.png"
					style={{ width: '100%', height: '100%' }}
					alt="소아"
				/>
			</Box>
			<Stack gap={8}>
				<Text
					fz={theme.fontSizes.mdLg}
					fw={700}
					c={theme.colors[theme.primaryColor][6]}
				>
					소아
				</Text>
				<Text fz="md" fw={400} c="#9E9E9E">
					(6년 ~ 12년)
				</Text>
			</Stack>
		</>,
	];
	const handleAgeSelection = (index: number) => {
		setAge(ageTypes[index]);
		onNext();
	};

	return (
		<div>
			<Text fz="xl" c="#222222" fw={700}>
				아이의 나이대가
				<br />
				어떻게 되나요?
			</Text>
			<Spacer height={48} />
			<Grid gutter="md">
				{texts.map((text, index) => (
					<Grid.Col span={6} key={ageTypes[index]}>
						<Item
							index={index}
							handleAgeSelection={handleAgeSelection}
							theme={theme}
						>
							{text}
						</Item>
					</Grid.Col>
				))}
			</Grid>
		</div>
	);
};

export default Chapter1;
