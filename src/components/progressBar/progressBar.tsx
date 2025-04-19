import { Box } from '@mantine/core';

interface ProgressBarProps {
	completed: number;
	total: number;
}

const ProgressBar = ({ completed, total }: ProgressBarProps) => {
	const percentage = (completed / (completed + total)) * 100;

	return (
		<Box
			w="100%"
			h={8}
			style={{ backgroundColor: '#bfbfbf', borderRadius: '4px' }}
		>
			<Box
				h="100%"
				style={{
					width: `${percentage}%`,
					backgroundColor: '#729bed',
					borderRadius: '4px',
					transition: 'width 0.3s ease-in-out',
				}}
			/>
		</Box>
	);
};

export default ProgressBar;
