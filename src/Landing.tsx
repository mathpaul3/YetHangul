import React, { useRef, useState } from "react";
import { hanguelToYetHanguel, isJongSung, isJungSung } from "@/functions";
import {
  initialPhonemeState,
  initialKeyState,
  PhonemeStateType,
  KeyStateType,
} from "@/types";
import {
  Shifts,
  Ctrls,
  ChoSungsWithExplanation,
  JongSungsWithExplanation,
  JungSungsWithExplanation,
} from "@/variables";

function Landing() {
  const [text, setText] = useState("");
  const [phonemeState, _] = useState<PhonemeStateType>(initialPhonemeState);
  const [keyState, __] = useState<KeyStateType>(initialKeyState);
  const ref = useRef<HTMLTextAreaElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let result = hanguelToYetHanguel(phonemeState, keyState);
    phonemeState.after = (result[0] as string)?.normalize("NFKD") ?? "";
    if (result != "" && result != phonemeState.curKey) {
      if (isJongSung(phonemeState.before) && isJungSung(phonemeState.after)) {
        let chosung_result = hanguelToYetHanguel(
          {
            ago: "",
            before: "",
            after: "",
            lastKey: "",
            curKey: phonemeState.lastKey,
          },
          keyState
        );
        setText(
          (prv) =>
            prv.slice(0, text.length - 1) +
            (isJongSung(phonemeState.ago) ? phonemeState.ago : "") +
            (chosung_result[0] as string) +
            (result[0] as string) +
            prv.slice(text.length)
        );
      } else {
        setText(
          (prv) =>
            prv.slice(0, text.length - ((result[1] as boolean) ? 1 : 0)) +
            (result[0] as string) +
            prv.slice(text.length)
        );
      }
    } else {
      setText(e.target.value);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    phonemeState.lastKey = phonemeState.curKey;
    if (["Backspace", "Shift", "Control", "Meta"].includes(e.key)) {
      if (e.key == "Backspace") {
        phonemeState.ago = "";
        phonemeState.before = "";
        phonemeState.after = "";
        phonemeState.lastKey = "";
        phonemeState.curKey = "";
        return;
      }
      keyState.rightCtrlKey = e.ctrlKey && e.location == 1;
      keyState.leftShiftKey = e.shiftKey && e.location == 1;
      keyState.rightShiftKey = e.shiftKey && e.location == 2;
    } else {
      phonemeState.ago = phonemeState.before;
      phonemeState.before = phonemeState.after;
      phonemeState.curKey = e.key;
      if (keyState.leftCtrlKey || keyState.rightCtrlKey) {
        onChange(e as any);
      }
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (["Backspace", "Shift", "Control", "Meta"].includes(e.key)) {
      if (e.key == "Backspace") {
        phonemeState.ago = initialPhonemeState.ago;
        phonemeState.before = initialPhonemeState.before;
        phonemeState.after = initialPhonemeState.after;
        phonemeState.lastKey = initialPhonemeState.lastKey;
        phonemeState.curKey = initialPhonemeState.curKey;
        return;
      }
      keyState.leftCtrlKey = e.ctrlKey && e.location == 1;
      keyState.rightCtrlKey =
        (e.ctrlKey && e.location == 2) || (e.metaKey && e.location == 2);
      keyState.leftShiftKey = e.shiftKey && e.location == 1;
      keyState.rightShiftKey = e.shiftKey && e.location == 2;
    } else {
      phonemeState.curKey = e.key;
    }
  };

  return (
    <div id="landing-page">
      <h1>옛한글 입력기</h1>
      <div className="row">
        <div className="col explanation">
          <h3>입력 방법</h3>
          <div className="byeongseo">
            <span className="title">병서 원리 </span>
            <br />
            ㅂ+ㅅ+ㄱ+ㅜ+ㄹ ⇨ ᄢᅮᆯ, ㄱ+ㅠ+ㅏ+ㄴ ⇨ ᄀᆎᆫ, ㅌ+ㅣ+ㅑ+ㄴ ⇨ ᄐᆙᆫ
          </div>
          <div className="supporting-characters">
            <span className="title">
              지원되는 글자 (
              <a href="https://charset.fandom.com/ko/wiki/%EC%9C%A0%EB%8B%88%EC%BD%94%EB%93%9C_%EC%98%9B%ED%95%9C%EA%B8%80_1638750%EC%9E%90">
                링크
              </a>
              )
            </span>
            <br />
            초성 125자 × 중성 95자 × 종성 138자 및 방점 (거성 〮, 상성 〯)
            <details className="show-all">
              <summary>전체 보기</summary>
              <div>
                <table className="char-list">
                  <tbody>
                    {ChoSungsWithExplanation.map((_, index, array) => {
                      let items_per_row = 8;
                      if (index % items_per_row == 0) {
                        return (
                          <tr key={"cs-tr" + index}>
                            {array
                              .slice(index, index + items_per_row)
                              .map((item, inner_index) => {
                                return (
                                  <React.Fragment
                                    key={
                                      "cs-td" +
                                      index * items_per_row +
                                      inner_index
                                    }
                                  >
                                    <td className="char">{item[0]}</td>
                                    <td className="char-explanation">
                                      {item[1]}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                  <tbody>
                    {JungSungsWithExplanation.map((_, index, array) => {
                      let items_per_row = 8;
                      if (index % items_per_row == 0) {
                        return (
                          <tr key={"jus-tr" + index}>
                            {array
                              .slice(index, index + items_per_row)
                              .map((item, inner_index) => {
                                return (
                                  <React.Fragment
                                    key={
                                      "jus-td" +
                                      index * items_per_row +
                                      inner_index
                                    }
                                  >
                                    <td className="char">{item[0]}</td>
                                    <td className="char-explanation">
                                      {item[1]}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                  <tbody>
                    {JongSungsWithExplanation.map((_, index, array) => {
                      let items_per_row = 8;
                      if (index % items_per_row == 0) {
                        return (
                          <tr key={"jos-tr" + index}>
                            {array
                              .slice(index, index + items_per_row)
                              .map((item, inner_index) => {
                                return (
                                  <React.Fragment
                                    key={
                                      "jos-td" +
                                      index * items_per_row +
                                      inner_index
                                    }
                                  >
                                    <td className="char">{item[0]}</td>
                                    <td className="char-explanation">
                                      {item[1]}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
          <div className="row lower">
            <div className="col shift">
              <span className="title-sm">
                <code>Shift</code> + 자음/모음 ⇨ 쌍자음/쌍모음
              </span>
              <table>
                <tbody>
                  {Shifts.map((item, index) => {
                    return (
                      <tr key={"shift" + index}>
                        <td
                          style={{
                            textAlign: "center",
                          }}
                        >
                          {item[0] + " + " + item[1]}
                        </td>
                        <td
                          style={{
                            padding: "0 1rem",
                          }}
                        >
                          {item[2]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="col ctrl">
              <span className="title-sm">
                <code>Ctrl</code> + 자음/모음 ⇨ 자형 변환 (반치음ᅀ 예외)
              </span>
              <table>
                <tbody>
                  {Ctrls.map((item, index) => {
                    return (
                      <tr key={"ctrl" + index}>
                        <td
                          style={{
                            textAlign: "center",
                            color: item[0] == "Shift" ? "red" : "",
                          }}
                        >
                          {item[0] + " + " + item[1]}
                        </td>
                        <td
                          style={{
                            padding: "0 1rem",
                          }}
                        >
                          {item[2]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <textarea
          ref={ref}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />
      </div>
    </div>
  );
}

export default Landing;
