'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import useNavigation from '@/hook/useNavigation';
import {
	Box,
	Text,
	Title,
	Stack,
	Container,
	Space,
	Divider,
} from '@mantine/core';

const Privacy = () => {
	const { goBack } = useNavigation();

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title="개인정보 처리방침"
			onBack={goBack}
			currentRoute="/more/report"
		>
			<Container size="md" py="xl">
				<Text ta="left" mb="lg">
					이 개인정보처리방침은 2025년 5월 12일부터 적용됩니다.
				</Text>

				<Stack gap="xl">
					<Box>
						<Title order={3}>제1조(개인정보의 처리 목적)</Title>
						<Space h="xs" />
						<Text>
							오늘의아이 with김봉섭은(는) 다음의 목적을 위하여
							개인정보를 처리합니다. 처리하고 있는 개인정보는
							다음의 목적 이외의 용도로는 이용되지 않으며 이용
							목적이 변경되는 경우에는 「개인정보 보호법」
							제18조에 따라 별도의 동의를 받는 등 필요한 조치를
							이행할 예정입니다.
						</Text>
						<Space h="xs" />
						<Text fw={500}>1. 홈페이지 회원가입 및 관리</Text>
						<Text ml="md">
							회원 가입의사 확인, 회원제 서비스 제공에 따른 본인
							식별·인증, 회원자격 유지·관리, 각종 고지·통지
							목적으로 개인정보를 처리합니다.
						</Text>

						<Text fw={500}>2. 재화 또는 서비스 제공</Text>
						<Text ml="md">
							물품배송, 서비스 제공, 콘텐츠 제공을 목적으로
							개인정보를 처리합니다.
						</Text>

						<Text fw={500}>3. 마케팅 및 광고에의 활용</Text>
						<Text ml="md">
							신규 서비스(제품) 개발 및 맞춤 서비스 제공 등을
							목적으로 개인정보를 처리합니다.
						</Text>
					</Box>

					<Divider />

					<Box>
						<Title order={3}>
							제2조(개인정보의 처리 및 보유 기간)
						</Title>
						<Space h="xs" />
						<Text>
							① 오늘의아이 with 김봉섭은(는) 법령에 따른 개인정보
							보유·이용기간 또는 정보주체로부터 개인정보를 수집
							시에 동의받은 개인정보 보유·이용기간 내에서
							개인정보를 처리·보유합니다.
						</Text>
						<Text>
							② 각각의 개인정보 처리 및 보유 기간은 다음과
							같습니다.
						</Text>
						<Space h="xs" />
						<Text fw={500}>1. 홈페이지 회원가입 및 관리</Text>
						<Text ml="md">
							홈페이지 회원가입 및 관리와 관련한 개인정보는
							수집.이용에 관한 동의일로부터 1년까지 위 이용목적을
							위하여 보유.이용됩니다.
						</Text>
						<Text ml="md">
							보유근거 : 개인정보 민감 정보 1년 내 파기
						</Text>
						<Text ml="md">
							관련법령 : 표시/광고에 관한 기록 : 6개월
						</Text>
					</Box>

					<Divider />

					<Box>
						<Title order={3}>제3조(처리하는 개인정보의 항목)</Title>
						<Space h="xs" />
						<Text>
							① 오늘의아이 with 김봉섭은(는) 다음의 개인정보
							항목을 처리하고 있습니다.
						</Text>
						<Space h="xs" />
						<Text fw={500}>1. 홈페이지 회원가입 및 관리</Text>
						<Text ml="md">
							필수항목 : 이름, 비밀번호, 휴대전화번호
						</Text>
						<Text ml="md">선택항목 : 이메일, 사진</Text>
					</Box>

					<Divider />

					<Box>
						<Title order={3}>
							제4조(개인정보의 파기절차 및 파기방법)
						</Title>
						<Space h="xs" />
						<Text>
							① 오늘의아이 with 김봉섭은(는) 개인정보 보유기간의
							경과, 처리목적 달성 등 개인정보가 불필요하게 되었을
							때에는 지체없이 해당 개인정보를 파기합니다.
						</Text>
						<Text>
							② 정보주체로부터 동의받은 개인정보 보유기간이
							경과하거나 처리목적이 달성되었음에도 불구하고 다른
							법령에 따라 개인정보를 계속 보존하여야 하는
							경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로
							옮기거나 보관장소를 달리하여 보존합니다.
						</Text>
						<Text ml="md">1. 법령 근거 :</Text>
						<Text ml="md">
							2. 보존하는 개인정보 항목 : 계좌정보, 거래날짜
						</Text>
						<Text>
							③ 개인정보 파기의 절차 및 방법은 다음과 같습니다.
						</Text>
						<Text ml="md">1. 파기절차</Text>
						<Text ml="md">
							오늘의아이 with 김봉섭은(는) 파기 사유가 발생한
							개인정보를 선정하고, 오늘의아이 with 김봉섭의
							개인정보 보호책임자의 승인을 받아 개인정보를
							파기합니다.
						</Text>
					</Box>

					<Divider />

					<Box>
						<Title order={3}>
							제5조(정보주체와 법정대리인의 권리·의무 및 그
							행사방법에 관한 사항)
						</Title>
						<Space h="xs" />
						<Text>
							① 정보주체는 오늘의아이 with 김봉섭에 대해 언제든지
							개인정보 열람·정정·삭제·처리정지 요구 등의 권리를
							행사할 수 있습니다.
						</Text>
						<Text>
							② 제1항에 따른 권리 행사는 오늘의아이 with 김봉섭에
							대해 「개인정보 보호법」 시행령 제41조제1항에 따라
							서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수
							있으며 오늘의아이 with 김봉섭은(는) 이에 대해 지체
							없이 조치하겠습니다.
						</Text>
						<Text>
							③ 제1항에 따른 권리 행사는 정보주체의 법정대리인이나
							위임을 받은 자 등 대리인을 통하여 하실 수 있습니다.
							이 경우 "개인정보 처리 방법에 관한 고시(제2020-7호)"
							별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
						</Text>
						<Text>
							④ 개인정보 열람 및 처리정지 요구는 「개인정보
							보호법」 제35조 제4항, 제37조 제2항에 의하여
							정보주체의 권리가 제한 될 수 있습니다.
						</Text>
						<Text>
							⑤ 개인정보의 정정 및 삭제 요구는 다른 법령에서 그
							개인정보가 수집 대상으로 명시되어 있는 경우에는 그
							삭제를 요구할 수 없습니다.
						</Text>
						<Text>
							⑥ 오늘의아이 with 김봉섭은(는) 정보주체 권리에 따른
							열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시
							열람 등 요구를 한 자가 본인이거나 정당한
							대리인인지를 확인합니다.
						</Text>
					</Box>

					<Divider />

					<Box>
						<Title order={3}>
							제11조(개인정보 보호책임자에 관한 사항)
						</Title>
						<Space h="xs" />
						<Text>
							① 오늘의아이 with 김봉섭은(는) 개인정보 처리에 관한
							업무를 총괄해서 책임지고, 개인정보 처리와 관련한
							정보주체의 불만처리 및 피해구제 등을 위하여 아래와
							같이 개인정보 보호책임자를 지정하고 있습니다.
						</Text>
						<Space h="xs" />
						<Text fw={500}>▶ 개인정보 보호책임자</Text>
						<Text ml="md">성명: 김봉섭</Text>
						<Text ml="md">직책: 개인</Text>
					</Box>

					<Divider />

					<Box>
						<Title order={3}>제16조(개인정보 처리방침 변경)</Title>
						<Space h="xs" />
						<Text>
							① 이 개인정보처리방침은 2025년 5월 12일부터
							적용됩니다.
						</Text>
						{/* <Text>
      ② 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.
    </Text> */}
					</Box>
				</Stack>
			</Container>
		</MobileLayout>
	);
};

export default Privacy;
