'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, CSSProperties } from '@mantine/core';
import { useDateStore } from '@/store/useDateStore';

// Mantine 스타일 정의
const wheelContainerStyle: CSSProperties = {
	position: 'relative',
	overflow: 'hidden',
	cursor: 'grab',
	touchAction: 'none',
	overscrollBehavior: 'none',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	MsUserSelect: 'none',
	WebkitMaskImage:
		'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
	maskImage:
		'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
};

const wheelTrackStyle: CSSProperties = {
	position: 'absolute',
	width: '100%',
	willChange: 'transform',
	transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
	transformStyle: 'preserve-3d',
	perspective: '1000px',
};

const wheelItemStyle: CSSProperties = {
	height: '40px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '0 10px',
	color: '#999',
	transform: 'translateZ(0)',
	transition: 'all 0.2s ease',
	opacity: 0.4,
};

const selectedItemStyle: CSSProperties = {
	color: '#000',
	fontWeight: 'bold',
	transform: 'scale(1.1)',
	opacity: 1,
	transition: 'all 0.2s ease',
};

const highlightStyle: CSSProperties = {
	position: 'absolute',
	left: 0,
	right: 0,
	top: '50%',
	transform: 'translateY(-20px)',
	height: '40px',
	backgroundColor: 'rgba(0, 0, 0, 0.02)',
	pointerEvents: 'none',
	borderTop: '1px solid rgba(0, 0, 0, 0.05)',
	borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
	boxShadow:
		'0 -15px 15px -15px rgba(0,0,0,0.1) inset, 0 15px 15px -15px rgba(0,0,0,0.1) inset',
};

interface WheelStyles {
	width?: number | string;
	height?: number | string;
	fontSize?: number | string;
}

interface WheelProps {
	startNum: number;
	endNum: number;
	initialValue: number;
	styles?: WheelStyles;
	isRepeating?: boolean;
	onChange?: (value: number) => void;
}

const Wheel = ({
	startNum,
	endNum,
	initialValue,
	styles,
	isRepeating = false,
	onChange,
}: WheelProps) => {
	const { setYear, setMonth, setDay } = useDateStore();
	const initialIndex = initialValue - startNum;
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);
	const isWheeling = useRef(false);
	const wheelTimeout = useRef<NodeJS.Timeout>();

	const ITEM_HEIGHT = 40;
	const REPEAT_COUNT = 5; // 반복할 횟수

	// 기본 숫자 배열 생성
	const baseNumbers = Array.from(
		{ length: endNum - startNum + 1 },
		(_, i) => startNum + i
	);

	// 반복된 숫자 배열 생성
	const numbers = isRepeating
		? Array.from(
				{ length: baseNumbers.length * REPEAT_COUNT },
				(_, i) => baseNumbers[i % baseNumbers.length]
		  )
		: baseNumbers;

	// 실제 값 계산 함수
	const getRealValue = (index: number) => {
		if (!isRepeating) return numbers[index];
		return baseNumbers[index % baseNumbers.length];
	};

	const updateSelectedItem = (newScrollTop: number) => {
		if (!containerRef.current || !highlightRef.current) return;

		const containerRect = containerRef.current.getBoundingClientRect();
		const centerY = containerRect.top + containerRect.height / 2;

		// S.wheelItem 대신 'wheel-item' 클래스명 사용
		const items = containerRef.current.getElementsByClassName('wheel-item');
		let selectedIndex = currentIndex;

		Array.from(items).forEach((item, index) => {
			const itemRect = item.getBoundingClientRect();
			const itemCenterY = itemRect.top + itemRect.height / 2;

			if (Math.abs(itemCenterY - centerY) < ITEM_HEIGHT / 2) {
				selectedIndex = index;
			}
		});

		if (selectedIndex !== currentIndex) {
			setCurrentIndex(selectedIndex);
			const realValue = getRealValue(selectedIndex);
			onChange?.(realValue);
			handleChange(realValue);
		}

		return selectedIndex;
	};

	const snapToItem = (index: number) => {
		setCurrentIndex(index);
		setScrollTop(index * ITEM_HEIGHT);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		setStartY(e.clientY);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;

		const delta = e.clientY - startY;
		const newScrollTop = scrollTop - delta;
		setScrollTop(newScrollTop);
		setStartY(e.clientY);

		updateSelectedItem(newScrollTop);
	};

	const handleMouseUp = () => {
		if (!isDragging) return;
		setIsDragging(false);
		snapToItem(currentIndex);
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		setIsDragging(true);
		setStartY(e.touches[0].clientY);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) return;

		const delta = e.touches[0].clientY - startY;
		const newScrollTop = scrollTop - delta;
		setScrollTop(newScrollTop);
		setStartY(e.touches[0].clientY);

		updateSelectedItem(newScrollTop);
	};

	const handleTouchEnd = () => {
		if (!isDragging) return;
		setIsDragging(false);
		snapToItem(currentIndex);
	};

	const handleWheel = (e: React.WheelEvent) => {
		if (isWheeling.current) return;
		isWheeling.current = true;

		const direction = e.deltaY > 0 ? 1 : -1;
		const newIndex = Math.min(
			Math.max(currentIndex + direction, 0),
			numbers.length - 1
		);

		setCurrentIndex(newIndex);
		const newScrollTop = newIndex * ITEM_HEIGHT;
		setScrollTop(newScrollTop);

		const realValue = getRealValue(newIndex);
		onChange?.(realValue);
		handleChange(realValue);

		if (wheelTimeout.current) {
			clearTimeout(wheelTimeout.current);
		}
		wheelTimeout.current = setTimeout(() => {
			isWheeling.current = false;
		}, 20);
	};

	const handleChange = (value: number) => {
		onChange?.(value);
		if (startNum === 2010) setYear(value);
		else if (startNum === 1 && endNum === 12) setMonth(value);
		else if (startNum === 1 && endNum === 31) setDay(value);
	};

	// Wheel 컴포넌트의 useEffect 수정
	useEffect(() => {
		// 초기 위치를 중앙으로 설정
		let middleIndex;

		if (isRepeating) {
			// 반복 모드에서는 반복 배열에서 올바른 위치를 찾아야 함
			const baseLength = endNum - startNum + 1;
			const repeatMiddle = Math.floor(REPEAT_COUNT / 2);
			const valueIndex = initialValue - startNum;
			middleIndex = repeatMiddle * baseLength + valueIndex;
		} else {
			// 비반복 모드에서는 단순히 인덱스 계산
			middleIndex = initialValue - startNum;
		}

		// 범위 체크
		middleIndex = Math.max(0, Math.min(middleIndex, numbers.length - 1));

		const initialScrollTop = middleIndex * ITEM_HEIGHT;
		setScrollTop(initialScrollTop);
		setCurrentIndex(middleIndex);
	}, [
		initialValue,
		startNum,
		endNum,
		isRepeating,
		numbers.length,
		ITEM_HEIGHT,
	]);

	return (
		<Box
			ref={containerRef}
			style={{
				...wheelContainerStyle,
				width: styles?.width || '100px',
				height: styles?.height || '200px',
				...(isDragging ? { cursor: 'grabbing' } : {}),
			}}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onWheel={handleWheel}
		>
			<Box
				style={{
					...wheelTrackStyle,
					transform: `translateY(${-scrollTop}px)`,
					transition: isDragging ? 'none' : 'transform 0.2s',
					padding: `${((styles?.height as number) || 200) / 2.5}px 0`,
				}}
			>
				{numbers.map((number, index) => (
					<Box
						key={`${number}-${index}`}
						className="wheel-item"
						style={{
							...wheelItemStyle,
							...(index === currentIndex
								? selectedItemStyle
								: {}),
							fontSize: styles?.fontSize || '16px',
						}}
					>
						{number}
					</Box>
				))}
			</Box>
			<Box ref={highlightRef} style={highlightStyle} />
		</Box>
	);
};

export default Wheel;
