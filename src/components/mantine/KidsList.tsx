'use client';

import React, { useState, useEffect } from 'react';
import { Text, Avatar, Stack, Group, UnstyledButton } from '@mantine/core';
import useAuth from '@/hook/useAuth';
import useChldrnListStore from '@/store/useChldrnListStore';
import { useAuthStore } from '@/store/useAuthStore';

// Kid 타입 정의
interface Kid {
	id: number;
	name: string;
	avatarColor: string;
	isActive?: boolean;
}

// Props 타입 정의
interface KidsListProps {
	onSelectKid?: (kid: Kid) => void;
}

// Sample data for kids - replace with your actual data source

const KidsList: React.FC<KidsListProps> = ({ onSelectKid }) => {
	const [kids, setKids] = useState<Kid[]>();
	const { getToken } = useAuth();
	const { setCrtChldrnNo } = useAuthStore();

	const handleSelectKid = (kid: Kid) => {
		// Update active status
		const updatedKids = kids?.map((k) => ({
			...k,
			isActive: k.id === kid.id,
		}));

		setKids(updatedKids);
		setCrtChldrnNo(kid.id.toString());

		// Callback to parent component
		if (onSelectKid) {
			onSelectKid(kid);
		}
	};

	useEffect(() => {
		const fetchKids = async () => {
			try {
				const token = await getToken();
				const response = await fetch('/api/child/getChildrenInfo', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const result = await response.json();

				if (response.ok) {
					// 응답 구조에 맞게 data 속성 접근
					setKids(result.data);
				} else {
					console.error('에러 메시지:', result.message);
				}
			} catch (error) {
				console.error('데이터 가져오기 오류:', error);
			}
		};
		if (!kids) {
			fetchKids();
		}
	}, []);

	return (
		<Stack gap="xs" style={{ minWidth: '100px' }}>
			{kids?.map((kid) => (
				<UnstyledButton
					key={kid.id}
					onClick={() => handleSelectKid(kid)}
					style={{
						borderRadius: '4px',
					}}
				>
					<Group>
						<Avatar color={kid.avatarColor} radius="xl">
							{kid.name.charAt(0)}
						</Avatar>
						<Text size="sm" fw={500}>
							{kid.name}
						</Text>
					</Group>
				</UnstyledButton>
			))}
		</Stack>
	);
};

export default KidsList;
