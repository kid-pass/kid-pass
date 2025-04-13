import { Flex, Paper, Text } from '@mantine/core';
import { Prescription } from './type/hospital';

function formatDate(dateString: string) {
	const date = new Date(dateString);

	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	const hours = date.getHours();
	const minutes = String(date.getMinutes()).padStart(2, '0');

	return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

const PrescritionItem = (props: Prescription & { onClick?: () => void }) => {
	// onClick과 나머지 속성 분리
	const { onClick, ...item } = props;

	return (
		<Paper
			withBorder
			p="md"
			radius="md"
			bg="white"
			onClick={onClick} // 여기에 onClick 이벤트 추가
			style={{ cursor: 'pointer' }} // 클릭 가능함을 시각적으로 표시
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
				{formatDate(item.date)}
			</Text>
		</Paper>
	);
};

export default PrescritionItem;
