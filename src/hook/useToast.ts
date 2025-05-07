// src/hooks/useToast.ts
import { notifications } from '@mantine/notifications';
import { useMantineTheme } from '@mantine/core';

interface ToastOptions {
	title?: string;
	message: string;
	position?:
		| 'top-left'
		| 'top-right'
		| 'top-center'
		| 'bottom-left'
		| 'bottom-right'
		| 'bottom-center';
	autoClose?: number | false;
}

export const useToast = () => {
	const theme = useMantineTheme();

	// 성공 toast
	const successToast = ({
		title,
		message,
		position = 'top-center',
		autoClose = 2000,
	}: ToastOptions) => {
		notifications.show({
			title,
			message,
			color: theme.other.statusColors.success,
			position,
			autoClose,
		});
	};

	// 오류 toast
	const errorToast = ({
		title,
		message,
		position = 'top-center',
		autoClose = 2000,
	}: ToastOptions) => {
		notifications.show({
			title,
			message,
			color: theme.other.statusColors.error,
			position,
			autoClose,
		});
	};

	return { successToast, errorToast };
};
