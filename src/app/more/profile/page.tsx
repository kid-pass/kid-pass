'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import { Box, Text } from '@mantine/core';

const App = () => {
	return (
		<MobileLayout
			title="프로필 관리"
			headerType="back"
			currentRoute="/more/profile"
		>
			<Box>
				<Text>프로필 관리</Text>
			</Box>
		</MobileLayout>
	);
};

export default App;
