import { Box, Text } from '@mantine/core';

interface MetricsProps {
	label: string;
	value?: string | null;
}

// 정보 항목을 표시하는 재사용 가능한 컴포넌트
const Metrics = ({ label, value }: MetricsProps) => {
	// 값이 없으면 컴포넌트를 렌더링하지 않음
	if (!value) return null;

	return (
		<Box mb="md">
			<Text fw={600} size="lg" c="#000000">
				{label}
			</Text>
			<Text>{value}</Text>
		</Box>
	);
};

export default Metrics;
