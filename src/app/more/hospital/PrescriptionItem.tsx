import { Box, Flex, Image, Paper, Text, useMantineTheme } from '@mantine/core';
import { Prescription } from './type/hospital';
import { common } from '@/utils/common';
import EmptyState from '@/components/EmptyState/EmptyState';

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
			<Box style={{ borderBottom: '1px dotted #BDBDBD' }}>
				<Flex align="center" mb={theme.spacing.sm}>
					<Text
						w="50%"
						fz="md"
						fw={500}
						c={theme.other.fontColors.sub3}
					>
						{getFormatDate(item.date)}
					</Text>
					<Text fz="md" c={theme.other.fontColors.primary} fw={500}>
						{item.hospital}
					</Text>
				</Flex>
				<Flex align="center" mb={theme.spacing.lg}>
					<Text
						w="50%"
						fw={600}
						fz="1.125rem"
						c={theme.other.fontColors.primary}
					>
						{item.diagnoses}
					</Text>
					<Text
						fw={600}
						fz="1.125rem"
						c={theme.other.fontColors.sub3}
					>
						{item.medicines}
					</Text>
				</Flex>
			</Box>
			<Box
				mt="lg"
				display="flex"
				style={{ flexDirection: 'column', gap: '12px' }}
			>
				<Text fw={600} fz="1.125rem" c={theme.other.fontColors.primary}>
					처방전 이미지
				</Text>
				{item.prescriptionImageUrl ? (
					<Image src={item.prescriptionImageUrl} w="100%" />
				) : (
					<EmptyState />
				)}
			</Box>
		</Paper>
	);
};

export default PrescritionItem;
