import { Box, Image, Text, useMantineTheme } from '@mantine/core';

// ProfileMetrics를 Mantine 컴포넌트로 변환
const ProfileMetrics = ({
	label,
	value,
	gender,
	alignItems = 'flex-start',
}: {
	label: string;
	gender?: string;
	value: string | number;
	alignItems?: 'flex-start' | 'center' | 'flex-end';
}) => {
	const theme = useMantineTheme();

	return (
		<Box
			display="flex"
			style={{
				flexDirection: 'column',
				gap: '5px',
				alignItems: alignItems,
			}}
		>
			<Text fz="smd" c="#646464">
				{label}
			</Text>
			<Box display="flex" style={{ gap: '4px', alignItems: 'self-end' }}>
				<Text fz={theme.fontSizes.mdLg} fw="700" c="#222222">
					{String(value)}
				</Text>
				{gender && (
					<Image
						w={19}
						h={19}
						src={
							gender === 'M' ? '/profile_M.svg' : '/profile_F.svg'
						}
					/>
				)}
			</Box>
		</Box>
	);
};

export default ProfileMetrics;
