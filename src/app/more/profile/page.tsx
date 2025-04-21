'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import useChldrnListStore from '@/store/useChldrnListStore';
import { Box, Image, Text, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';

const App = () => {
	const theme = useMantineTheme();
	const { children } = useChldrnListStore();

	useEffect(() => {
		console.log(children);
	}, []);

	return (
		<MobileLayout
			title="프로필 관리"
			headerType="back"
			currentRoute="/more/profile"
		>
			<Box px={theme.spacing.md}>
				<Box
					w="100%"
					style={{
						borderRadius: `${theme.radius.md}`,
						justifyContent: 'space-between',
						padding: `${theme.spacing.md}`,
					}}
					bg={theme.colors.brand[0]}
					display="flex"
				>
					<Box
						display="flex"
						style={{ alignItems: 'center', gap: '12px' }}
					>
						<Image src="/profile.png" w="88px" height="88px" />
						<Box
							display="flex"
							style={{
								flexDirection: 'column',
								alignItems: 'flex-start',
								gap: '4px',
							}}
						>
							<Text
								c={theme.other.fontColors.sub1}
								fz={theme.fontSizes.sm}
								fw={400}
							>
								2024.09.28 출생
							</Text>
							<Box
								display="flex"
								style={{
									gap: '4px',
									justifyContent: 'flex-start',
								}}
							>
								<Text
									c={theme.other.fontColors.primary}
									fz={theme.fontSizes.lg}
									fw={600}
								>
									김첫째
								</Text>
								<Image src="/boySign.png" w="20" h="20" />
							</Box>
						</Box>
					</Box>
					<Box
						display="flex"
						style={{
							flexDirection: 'column',
							justifyContent: 'space-between',
						}}
					>
						<Box
							p="4px 14px"
							c="#BFBFBF"
							fz={theme.fontSizes.sm}
							fw="500"
							style={{
								borderRadius: '25px',
								border: '1px solid #BFBFBF',
								textAlign: 'center',
							}}
						>
							첫째
						</Box>
						<Text
							c={theme.other.fontColors.sub1}
							fz={theme.fontSizes.sm}
							fw={400}
						>
							프로필 수정
						</Text>
					</Box>
				</Box>
			</Box>
		</MobileLayout>
	);
};

export default App;
