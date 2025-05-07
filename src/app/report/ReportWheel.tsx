'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, CSSProperties } from '@mantine/core';

// 간소화된 스타일 정의
const wheelContainerStyle: CSSProperties = {
	position: 'relative',
	overflow: 'hidden',
	cursor: 'grab',
	touchAction: 'pan-x', // 수직 터치 동작만 중단
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
};

const wheelItemStyle: CSSProperties = {
	height: '40px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '0 10px',
	color: '#999',
	transition: 'all 0.2s ease',
	opacity: 0.4,
};

const selectedItemStyle: CSSProperties = {
	color: '#000',
	fontWeight: 'bold',
	transform: 'scale(1.1)',
	opacity: 1,
};

const highlightStyle: CSSProperties = {
	position: 'absolute',
	left: 0,
	right: 0,
	top: '50%',
	transform: 'translateY(-50%)', // 여기를 -50%로 변경
	height: '40px',
	backgroundColor: 'rgba(0, 0, 0, 0.02)',
	pointerEvents: 'none',
	borderTop: '1px solid rgba(0, 0, 0, 0.05)',
	borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
	boxShadow:
		'0 -15px 15px -15px rgba(0,0,0,0.1) inset, 0 15px 15px -15px rgba(0,0,0,0.1) inset',
};

interface ReportWheelProps {
	values: number[]; // 표시할 값들 (3, 7, 14)
	initialValue: number; // 초기 선택 값
	onChange: (value: number) => void; // 값 변경 시 호출될 함수
	width?: number | string;
	height?: number | string;
	fontSize?: number | string;
}

const ReportWheel = ({
	values,
	initialValue,
	onChange,
	width = '100%',
	height = '120px',
	fontSize = '16px',
}: ReportWheelProps) => {
	// 초기 인덱스 찾기
	const initialIndex =
		values.indexOf(initialValue) !== -1 ? values.indexOf(initialValue) : 0;

	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);
	const isWheeling = useRef(false);
	const wheelTimeout = useRef<NodeJS.Timeout>();

	const ITEM_HEIGHT = 40;

	// 휠 아이템 업데이트 함수
	const updateSelectedItem = (newScrollTop: number) => {
		if (!containerRef.current || !highlightRef.current) return;

		const containerRect = containerRef.current.getBoundingClientRect();
		const centerY = containerRect.top + containerRect.height / 2;
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
			onChange(values[selectedIndex]);
		}

		return selectedIndex;
	};

	const snapToItem = (index: number) => {
		setCurrentIndex(index);
		setScrollTop(index * ITEM_HEIGHT);
	};

	// 마우스/터치 이벤트 핸들러
	const handleMouseDown = (e: React.MouseEvent) => {
		// 컴포넌트 내부에서만 마우스 이벤트 처리
		e.preventDefault();
		setIsDragging(true);
		setStartY(e.clientY);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;

		// 드래그 중일 때만 이벤트 처리
		e.preventDefault();

		const delta = e.clientY - startY;
		const newScrollTop = scrollTop - delta;
		setScrollTop(newScrollTop);
		setStartY(e.clientY);

		updateSelectedItem(newScrollTop);
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		if (!isDragging) return;
		setIsDragging(false);
		snapToItem(currentIndex);
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		// 컴포넌트에 터치가 시작될 때 이벤트 처리
		if (
			containerRef.current &&
			containerRef.current.contains(e.target as Node)
		) {
			// 컴포넌트 내부의 터치만 처리
			e.stopPropagation();
			setIsDragging(true);
			setStartY(e.touches[0].clientY);
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) return;

		// 드래그 중일 때만 이벤트 처리
		if (
			containerRef.current &&
			containerRef.current.contains(e.target as Node)
		) {
			e.stopPropagation();

			const delta = e.touches[0].clientY - startY;
			const newScrollTop = scrollTop - delta;
			setScrollTop(newScrollTop);
			setStartY(e.touches[0].clientY);

			updateSelectedItem(newScrollTop);
		}
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!isDragging) return;
		setIsDragging(false);
		snapToItem(currentIndex);
	};

	const handleWheel = (e: React.WheelEvent) => {
		// 컴포넌트 내부의 휠 이벤트만 처리
		if (
			containerRef.current &&
			containerRef.current.contains(e.target as Node)
		) {
			e.stopPropagation();

			if (isWheeling.current) return;
			isWheeling.current = true;

			const direction = e.deltaY > 0 ? 1 : -1;
			const newIndex = Math.min(
				Math.max(currentIndex + direction, 0),
				values.length - 1
			);

			setCurrentIndex(newIndex);
			const newScrollTop = newIndex * ITEM_HEIGHT;
			setScrollTop(newScrollTop);
			onChange(values[newIndex]);

			if (wheelTimeout.current) {
				clearTimeout(wheelTimeout.current);
			}
			wheelTimeout.current = setTimeout(() => {
				isWheeling.current = false;
			}, 20);
		}
	};

	// 초기 위치 설정
	useEffect(() => {
		const index = values.indexOf(initialValue);
		const validIndex = index !== -1 ? index : 0;

		setCurrentIndex(validIndex);
		setScrollTop(validIndex * ITEM_HEIGHT);

		// 초기 렌더링에는 onChange를 호출하지 않도록 수정
		// 이전 값과 다를 때만 호출
	}, [initialValue, values]);

	// 패딩 계산 (중앙 정렬을 위한)
	const paddingValue = `${Math.max(
		parseInt(height as string) / 2 - ITEM_HEIGHT / 2,
		0
	)}px`;

	return (
		<Box
			ref={containerRef}
			style={{
				...wheelContainerStyle,
				width,
				height,
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
					paddingTop: paddingValue,
					paddingBottom: paddingValue,
				}}
			>
				{values.map((value, index) => (
					<Box
						key={`value-${value}`}
						className="wheel-item"
						style={{
							...wheelItemStyle,
							...(index === currentIndex
								? selectedItemStyle
								: {}),
							fontSize,
						}}
					>
						{value}
					</Box>
				))}
			</Box>
			<Box ref={highlightRef} style={highlightStyle} />
		</Box>
	);
};

export default ReportWheel;
