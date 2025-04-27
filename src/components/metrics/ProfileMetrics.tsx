import { Stack, Text, useMantineTheme } from '@mantine/core';

// ProfileMetrics를 Mantine 컴포넌트로 변환
const ProfileMetrics = ({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) => {
	const theme = useMantineTheme();

	return (
		<Stack gap={4}>
			<Text fz="sm" fw="600" c="#646464">
				{label}
			</Text>
			<Text fz={theme.fontSizes.mdLg} fw="700" c="#000000">
				{String(value)}
			</Text>
		</Stack>
	);
};

export default ProfileMetrics;
