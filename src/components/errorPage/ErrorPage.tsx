import { Label } from '@/elements/label/Label';
import styles from './error.module.css';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
	onRetry: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ onRetry }) => {
	const router = useRouter();

	const handleGoBack = () => {
		router.back();
	};

	return (
		<div className={styles.container}>
			<img src="/images/error.png" alt="에러 이미지" />
			<Label
				css="errorText"
				text="일시적인 오류로 인해<br/>화면을 불러오지 못했어요"
			/>
			<div className={styles.btnArea}>
				{/* <Button
          css="errorBtn"
          onClick={onRetry}
        >
          다시 시도하기
        </Button>
        <Button
          css="errorBtn"
          onClick={handleGoBack}
        >
          이전 화면으로
        </Button> */}
			</div>
		</div>
	);
};

export default ErrorPage;
