'use client';

import React, { useState } from 'react';
import { ChapterProps } from '@/hook/useChapter';
import Circleline from '@/elements/svg/Checkbox';
import XIcon from '@/elements/svg/XIcon';
import { useChldrnInfoStore } from '@/store/useChldrnInfoStore';
import {
	Box,
	Button,
	Flex,
	Text,
	TextInput,
	useMantineTheme,
} from '@mantine/core';

const Chapter5: React.FC<ChapterProps> = ({ onNext }) => {
	const theme = useMantineTheme();
	const [symptomInputValue, setSymptomInputValue] = useState('');
	const [allergicInputValue, setAllergicInputValue] = useState('');
	const [symptomList, setSymptomList] = useState<string[]>([]);
	const [allergicList, setAllergicList] = useState<string[]>([]);

	const setSymptom = useChldrnInfoStore((state) => state.setSymptom);
	const setAllergic = useChldrnInfoStore((state) => state.setAllergic);

	const listInputStyleProps = {
		input: {
			height: '50px',
			lineHeight: '50px',
			width: '100%',
			padding: 0,
			borderTop: 'none',
			borderLeft: 'none',
			borderRight: 'none',
			borderBottom: '1px solid #d9d9d9',
			borderRadius: 0,
			fontWeight: 700,
			marginBottom: '20px',
			'&::placeholder': {
				color: '#d9d9d9',
				fontSize: '16px',
				fontWeight: 700,
			},
		},
		wrapper: {
			width: '100%',
		},
	};

	// 증상 추가
	const addSymptom = () => {
		const trimmedValue = symptomInputValue.trim();
		if (trimmedValue && !symptomList.includes(trimmedValue)) {
			setSymptomList((prev) => [...prev, trimmedValue]);
			setSymptomInputValue('');
		}
	};

	// 증상 입력
	const handleSymptomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// 한글 입력 중이면 무시
		if (e.nativeEvent.isComposing) {
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			addSymptom();
		}
	};

	// 증상 삭제
	const removeSymptom = (index: number) => {
		setSymptomList((prev) => prev.filter((_, i) => i !== index));
	};

	// 알레르기 추가 함수
	const addAllergic = () => {
		const trimmedValue = allergicInputValue.trim();

		if (trimmedValue && !allergicList.includes(trimmedValue)) {
			setAllergicList((prev) => {
				return [...prev, trimmedValue];
			});
			setAllergicInputValue('');
		}
	};

	// 알레르기 입력
	const handleAllergicKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		// 한글 입력 중이면 무시
		if (e.nativeEvent.isComposing) {
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			addAllergic();
		}
	};
	// 알레르기 삭제
	const removeAllergic = (index: number) => {
		setAllergicList((prev) => prev.filter((_, i) => i !== index));
	};

	const handleNext = () => {
		// Zustand store에 저장
		setSymptom(symptomList);
		setAllergic(allergicList);

		// 부모 컴포넌트로 이동
		onNext();
	};

	return (
		<Box>
			<Text fz="xl" c="#222222" fw={700}>
				과거 증상과
				<br />
				진료 기록을 알려주세요
			</Text>
			<Box mt={48} pos="relative">
				<Text fz="lg" fw={700} c={theme.other.fontColors.sub2}>
					과거에 진단받은 질환을 적어주세요
				</Text>
				<div className="flex gap-12">
					<TextInput
						value={symptomInputValue}
						placeholder="ex:아토피"
						onChange={(e) => setSymptomInputValue(e.target.value)}
						onKeyDown={handleSymptomKeyDown}
						variant="unstyled"
						size="1rem"
						styles={listInputStyleProps}
					/>
					<Circleline
						color="#729BED"
						className="symptomInputCheckbox"
						onClick={addSymptom}
					/>
				</div>
			</Box>
			<Box mt={20} mb={48} display="column" style={{ gap: '8px' }}>
				{symptomList.map((symptom, index) => (
					<Flex
						key={index}
						justify="space-between"
						align="center"
						bg="#f4f4f4"
						h={40}
						px={20}
						style={{ borderRadius: '8px' }}
					>
						<Text>{symptom}</Text>
						<Box
							style={{ cursor: 'pointer' }}
							onClick={() => removeSymptom(index)}
						>
							<XIcon color="#222222" />
						</Box>
					</Flex>
				))}
			</Box>

			<Box mt={48} pos="relative">
				<Text fz="lg" fw={700} c={theme.other.fontColors.sub2}>
					약품이나 식품에
					<br />
					알러지가 있다면 적어주세요
				</Text>
				<div className="flex gap-12">
					<TextInput
						value={allergicInputValue}
						placeholder="ex:땅콩"
						onChange={(e) => setAllergicInputValue(e.target.value)}
						onKeyDown={handleAllergicKeyDown}
						variant="unstyled"
						size="1rem"
						styles={listInputStyleProps}
					/>
					<Circleline
						color="#729BED"
						className="allergicInputCheckbox"
						onClick={addAllergic}
					/>
				</div>
			</Box>
			<Box mt={20} mb={120} display="column" style={{ gap: '8px' }}>
				{allergicList.map((allergic, index) => (
					<Flex
						key={index}
						justify="space-between"
						align="center"
						bg="#f4f4f4"
						h={40}
						px={20}
						style={{ borderRadius: '8px' }}
					>
						<Text>{allergic}</Text>
						<Box
							style={{ cursor: 'pointer' }}
							onClick={() => removeSymptom(index)}
						>
							<XIcon color="#222222" />
						</Box>
					</Flex>
				))}
			</Box>
			<Button onClick={handleNext} fullWidth c="#FFFFFF">
				다음
			</Button>
		</Box>
	);
};

export default Chapter5;
