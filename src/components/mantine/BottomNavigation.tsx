import React from 'react';
import {
	Flex,
	UnstyledButton,
	Stack,
	Text,
	Center,
	Image,
} from '@mantine/core';
import { useRouter } from 'next/navigation';

interface NavItem {
	label: string;
	icon: string;
	path: string;
}

interface BottomNavigationProps {
	currentRoute: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
	currentRoute,
}) => {
	const router = useRouter();

	const navItems: NavItem[] = [
		{
			icon: '/images/icons/home.svg',
			label: '홈',
			path: '/home',
		},
		{
			icon: '/images/icons/ruler.svg',
			label: '아이기록',
			path: '/record',
		},
		{
			icon: '/images/icons/book.svg',
			label: '아기수첩',
			path: '/note',
		},
		{
			icon: '/images/icons/cross_icon.svg',
			label: '병원기록',
			path: '/more/hospital',
		},
		{
			icon: '/images/icons/more.svg',
			label: '더보기',
			path: '/more',
		},
	];

	return (
		<Flex
			h={60}
			style={{
				borderTop: '1px solid var(--mantine-color-gray-2)',
				paddingBottom: 'env(safe-area-inset-bottom, 0)',
				background: 'white',
			}}
		>
			{navItems.map((item) => (
				<UnstyledButton
					key={item.path}
					onClick={() => router.push(item.path)}
					style={{
						flex: 1,
						color:
							currentRoute === item.path
								? 'var(--mantine-color-brand-6)'
								: 'var(--mantine-color-gray-6)',
					}}
				>
					<Stack align="center" justify="center" h="100%">
						<Center>
							<Image
								src={item.icon}
								alt={item.label}
								width={24}
								height={24}
								style={{
									filter:
										currentRoute === item.path
											? 'brightness(0) saturate(100%) invert(51%) sepia(50%) saturate(2478%) hue-rotate(189deg) brightness(88%) contrast(96%)'
											: 'none',
								}}
							/>
						</Center>
						<Text size="xs" fw={500}>
							{item.label}
						</Text>
					</Stack>
				</UnstyledButton>
			))}
		</Flex>
	);
};

export default BottomNavigation;
