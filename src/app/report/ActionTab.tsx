'use client';

import { Box, Text } from '@mantine/core';
import { useState, useEffect } from 'react';

interface ActionTabProps {
	onEditingChange?: (isEditing: boolean) => void;
}

const ActionTab = ({ onEditingChange }: ActionTabProps) => {
	const [isEditing, setIsEditing] = useState(false);

	// isEditing 상태가 변경될 때마다 부모 컴포넌트에 알림
	useEffect(() => {
		onEditingChange?.(isEditing);
	}, [isEditing, onEditingChange]);

	// 수정하기 버튼 클릭 시
	const handleEditClick = () => {
		setIsEditing(true);
	};

	// 취소 버튼 클릭 시
	const handleCancelClick = () => {
		setIsEditing(false);
	};

	return (
		<Box
			mt="48px"
			display="flex"
			w="100%"
			style={{ justifyContent: 'space-around' }}
		>
			{isEditing ? (
				// 수정 모드일 때 표시할 버튼
				<>
					<Text
						c="#000000"
						fw={600}
						fz="md-lg"
						style={{ cursor: 'pointer' }}
						onClick={handleCancelClick}
					>
						취소
					</Text>
					<Text c="#000000" fw={600} fz="md-lg">
						수정완료
					</Text>
				</>
			) : (
				// 기본 모드일 때 표시할 버튼
				<>
					<Text
						c="#000000"
						fw={600}
						fz="md-lg"
						style={{ cursor: 'pointer' }}
						onClick={handleEditClick}
					>
						수정하기
					</Text>
					<Text c="#000000" fw={600} fz="md-lg">
						발행하기
					</Text>
				</>
			)}
		</Box>
	);
};

export default ActionTab;
