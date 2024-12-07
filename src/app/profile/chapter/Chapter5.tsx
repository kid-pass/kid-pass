"use client";

import React, { useState } from "react";
import { Label } from "@/elements/label/Label";
import Button from "@/elements/button/Button";
import { ChapterProps } from "@/hook/useChapter";
import styles from "../profile.module.css";
import { useProfileStore } from "@/store/useProfileStore"; // Zustand store import
import { useModalStore } from "@/store/useModalStore";

const Chapter5: React.FC<ChapterProps> = ({ onNext }) => {
    const [etcInput, setEtcInput] = useState(""); // 입력 상태 관리
    const setEtc = useProfileStore((state) => state.setEtc); // Zustand 상태 업데이트 함수 가져오기
    const { openModal } = useModalStore();

    const handleNext = () => {
        setEtc(etcInput); // Zustand store에 저장
        onNext(); // 다음 단계로 이동
        openModal();
    };

    return (
        <div>
            <Label
                css="profileLabel"
                text="김아기에 대해<br>
더 알려줄 것이 있나요?"
            />
            <div className={styles.etcArea}>
                <textarea
                    className={styles.etcInput}
                    placeholder={`병원에서 미리 알아두면 좋을\n특이 사항이 있다면 적어주세요`}
                    value={etcInput}
                    onChange={(e) => setEtcInput(e.target.value)} // 상태 업데이트
                />
            </div>
            <Button
                css="nextBtn"
                onClick={handleNext}
                label="작성 완료"
            ></Button>
        </div>
    );
};

export default Chapter5;
