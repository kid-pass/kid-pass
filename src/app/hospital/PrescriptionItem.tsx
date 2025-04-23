import { Flex, Paper, Text, useMantineTheme } from '@mantine/core';
import { Prescription } from './type/hospital';
import { common } from '@/utils/common';

const PrescritionItem = (props: Prescription & { onClick?: () => void }) => {
	// onClick과 나머지 속성 분리
	const { onClick, ...item } = props;
	const { getFormatDate } = common();
	const theme = useMantineTheme();

	return (
		<Paper
			withBorder
			p="md"
			radius="s"
			bg="white"
			onClick={onClick} // 여기에 onClick 이벤트 추가
			style={{
				cursor: 'pointer',
				boxShadow: `${theme.other.shadow.basic}`,
			}} // 클릭 가능함을 시각적으로 표시
		>
			<Flex justify="space-between" align="center" mb="xs">
				<Text fw={600} fz="md">
					{item.diagnoses}
				</Text>
				<Text fz="md" c="dimmed">
					{item.hospital}
				</Text>
			</Flex>
			<Text fz="sm" c="gray.6">
				{getFormatDate(item.date)}
			</Text>
		</Paper>
	);
};

export default PrescritionItem;
