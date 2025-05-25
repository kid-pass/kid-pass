import { Box, Image, Text, useMantineTheme } from '@mantine/core';

// ProfileMetrics를 Mantine 컴포넌트로 변환
const ProfileMetrics = ({
	label,
	value,
	gender,
}: {
	label: string;
	gender?: string;
	value: string | number;
}) => {
	const theme = useMantineTheme();

	return (
		<Box display="flex" style={{ flexDirection: 'column', gap: '8px' }}>
			<Text fz="sm" fw="600" c="#646464">
				{label}
			</Text>
			<Box display="flex" style={{ gap: '4px', alignItems: 'self-end' }}>
				<Text fz={theme.fontSizes.mdLg} fw="700" c="#000000">
					{String(value)}
				</Text>
				{gender && (
					<Image
						w={20}
						h={20}
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
