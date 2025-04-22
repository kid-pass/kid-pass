'use client';

import { Box, Text, useMantineTheme } from '@mantine/core';

const EmptyState = () => {
	const theme = useMantineTheme();

	return (
		<>
			<Box
				w="100%"
				bg={theme.colors.brand[12]}
				style={{
					borderRadius: `${theme.radius.md}`,
					justifyContent: 'center',
					alignItems: 'center',
				}}
				p="44px 106px"
				display="flex"
			>
				<Text
					fw={600}
					c={theme.other.fontColors.empty}
					fz="md"
					style={{ whiteSpace: 'nowrap' }}
				>
					아직 기록이 없습니다
				</Text>
			</Box>
		</>
	);
};

export default EmptyState;
