"use client";

import InputForm from "@/components/form/InputForm";
import Container from "@/elements/container/Container";
import { Label } from "@/elements/label/Label";
import { useState } from "react";
import Spacer from "@/elements/spacer/Spacer";
import Button from "@/elements/button/Button";
import useFetch from "@/hook/useFetch";
import Header from "@/components/header/Header";
import { useRouter } from "next/navigation";
import CustomDateTimePicker from "@/components/customDateTimePicker/CustomDateTimePicker";
import styles from "./emotion.module.css";
import Grid from "@/elements/grid/Grid";
import Image from "next/image";
import TextAreaForm from "@/components/textArea/TextArea";

const EMTIONS = [
  "행복해요",
  "활발해요",
  "평온해요",
  "나른해요",
  "불편해요",
  "슬퍼요",
];

const SPECIALS = [
  "없음",
  "놀이를 했어요",
  "외출했어요",
  "예방접종 했어요",
  "손님이 왔어요",
  "친구륾 만났어요",
];

const App: React.FC = () => {
  const router = useRouter();

  const [mealAmount, setMealAmount] = useState("");
  const [mealTy, setMealTy] = useState("");
  const [mealMemo, setMealMemo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [memo, setMemo] = useState("");
  const { sendRequest, responseData, loading } = useFetch();

  const onSubmit = (e: any) => {
    e.preventDefault();

    sendRequest({
      url: "report/createMealHist",
      method: "POST",
      body: {
        mealTy,
        mealAmount,
        mealUnit: "ml",
        mealMemo,
      },
    });
  };

  const emotions = EMTIONS.map((v, i) => (
    <button
      key={i}
      className={`${styles.kindButton} ${
        mealMemo === v ? styles.selected : ""
      }`}
      style={{ paddingTop: 8 }}
      onClick={() => setMealMemo(v)}
      type="button"
    >
      <Image
        src={`/images/emotion${i + 1}.png`}
        alt={v}
        width={64}
        height={64}
      />
      {v}
    </button>
  ));

  const specials = SPECIALS.map((v, i) => (
    <button key={i} className={styles.kindButton} type="button">
      {v}
    </button>
  ));

  return (
    <Container className="container">
      <Header title="감정 기록하기" onBack={() => router.back()} />
      <Spacer height={30} />
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100vh",
        }}
      >
        <Label css="inputForm" text="일시" />
        <Spacer height={10} />
        <CustomDateTimePicker
          selected={selectedDate}
          onSelect={(date) => setSelectedDate(date)}
        />

        <Spacer height={30} />
        <Label css="inputForm" text="아이의 기분은 어떤가요?" />
        <Spacer height={10} />
        <Grid items={emotions} column={3} />
        <Spacer height={30} />
        <Label css="inputForm" text="특별한 일이 있나요?" />
        <Spacer height={10} />
        <Grid items={specials} column={2} />
        <Spacer height={30} />

        <TextAreaForm
          labelText="메모"
          labelCss="inputForm"
          value={memo}
          onChange={setMemo}
          placeholder="메모를 입력해주세요"
          maxLength={200}
          errorMessage={memo.length > 200 ? "200자를 초과할 수 없습니다" : ""}
        />

        <Spacer height={30} />
        <Button label="등록하기" size="L" />
      </form>
    </Container>
  );
};

export default App;
