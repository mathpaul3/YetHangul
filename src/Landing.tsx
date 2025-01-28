import React, { useRef, useState } from "react";
import {
  hanguelToYetHanguel,
  isChoSung,
  isJongSung,
  isJungSung,
} from "@/functions";
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
  ChoSungs,
  JungSungs,
  JongSungs,
} from "@/variables";
import ReactGA from "react-ga4";

const buttons: {
  text: string;
  attr: keyof KeyStateType;
}[] = [
  {
    text: "LShift",
    attr: "leftShiftKey",
  },
  {
    text: "RShift",
    attr: "rightShiftKey",
  },
  {
    text: "LCtrl",
    attr: "leftCtrlKey",
  },
  {
    text: "RCtrl",
    attr: "rightCtrlKey",
  },
];

function Landing() {
  const [text, setText] = useState("");
  const [phonemeState, _] = useState<PhonemeStateType>(initialPhonemeState);
  const [keyState, setKeyState] = useState<KeyStateType>({
    ...initialKeyState,
  });
  const [metaKeyState, setMetaKeyState] = useState<boolean>(false);
  const [lockState, setLockState] = useState<KeyStateType>({
    ...initialKeyState,
  });
  const [buttonKeyState, setButtonKeyState] = useState<KeyStateType>({
    ...initialKeyState,
  });
  const ref = useRef<HTMLTextAreaElement>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    char?: string
  ) => {
    if (!window.location.href.includes("localhost")) {
      ReactGA.event({
        category: "Input",
        action: "옛한글 입력",
      });
    }

    phonemeState.lastKey = phonemeState.curKey;
    phonemeState.ago = phonemeState.before;
    phonemeState.before = phonemeState.after;

    let { data } = e.nativeEvent as InputEvent;
    phonemeState.curKey = char ?? data ?? "";

    let selectionStart =
      ref.current?.selectionStart ?? ref.current?.value.length ?? 0;
    let selectionEnd =
      ref.current?.selectionEnd ?? ref.current?.value.length ?? 0;

    let result = hanguelToYetHanguel(phonemeState, {
      leftCtrlKey: keyState.leftCtrlKey || buttonKeyState.leftCtrlKey,
      rightCtrlKey: keyState.rightCtrlKey || buttonKeyState.rightCtrlKey,
      leftShiftKey: keyState.leftShiftKey || buttonKeyState.leftShiftKey,
      rightShiftKey: keyState.rightShiftKey || buttonKeyState.rightShiftKey,
    });
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
          {
            leftCtrlKey: keyState.leftCtrlKey || buttonKeyState.leftCtrlKey,
            rightCtrlKey: keyState.rightCtrlKey || buttonKeyState.rightCtrlKey,
            leftShiftKey: keyState.leftShiftKey || buttonKeyState.leftShiftKey,
            rightShiftKey:
              keyState.rightShiftKey || buttonKeyState.rightShiftKey,
          }
        );
        setText(
          (prv) =>
            prv.slice(0, selectionStart - 1) +
            (isJongSung(phonemeState.ago) ? phonemeState.ago : "") +
            (chosung_result[0] as string) +
            (result[0] as string) +
            prv.slice(selectionEnd)
        );
        ref.current?.setSelectionRange(selectionStart + 1, selectionEnd + 1);
      } else {
        setText(
          (prv) =>
            prv.slice(0, selectionStart - ((result[1] as boolean) ? 1 : 0)) +
            (result[0] as string) +
            prv.slice(selectionEnd)
        );
      }
    } else {
      setText(
        (prv) =>
          prv.slice(0, selectionStart) +
          ((char ?? "").length > 1 ? "" : char) +
          prv.slice(selectionEnd)
      );
    }
    setButtonKeyState({
      leftCtrlKey: lockState.leftCtrlKey,
      rightCtrlKey: lockState.rightCtrlKey,
      leftShiftKey: lockState.leftShiftKey,
      rightShiftKey: lockState.rightShiftKey,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      [
        "Backspace",
        "Shift",
        "Control",
        "Meta",
        "CapsLock",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(e.key)
    ) {
      switch (e.key) {
        case "Enter": {
          setText((prv) => prv + "\n");
          break;
        }
        case "Backspace": {
          phonemeState.ago = "";
          phonemeState.before = "";
          phonemeState.after = "";
          phonemeState.lastKey = "";
          phonemeState.curKey = "";
          let selectionStart =
            ref.current!.selectionStart ?? ref.current!.value.length;
          let selectionEnd =
            ref.current!.selectionEnd ?? ref.current!.value.length;
          if (selectionStart == selectionEnd) {
            setText(
              (prv) =>
                prv.slice(0, selectionStart - 1) + prv.slice(selectionEnd)
            );
          } else {
            setText(
              (prv) => prv.slice(0, selectionStart) + prv.slice(selectionEnd)
            );
          }
          break;
        }
        case "Meta": {
          setMetaKeyState(true);
          break;
        }
        case "ArrowLeft": {
          let cursor = ref.current!.selectionStart;
          if (
            cursor > 0 &&
            [...ChoSungs, ...JungSungs, ...JongSungs].includes(text[cursor - 1])
          ) {
            if (cursor > 0 && isJongSung(text[cursor - 1])) {
              cursor -= 1;
            }
            if (cursor > 0 && isJungSung(text[cursor - 1])) {
              cursor -= 1;
            }
            if (cursor > 0 && isChoSung(text[cursor - 1])) {
              cursor -= 1;
            }
          } else {
            cursor -= 1;
          }
          cursor = Math.max(cursor, 0);
          ref.current!.setSelectionRange(cursor, cursor);
          break;
        }
        case "ArrowRight": {
          let cursor = ref.current!.selectionEnd;
          if (
            cursor < ref.current!.value.length &&
            [...ChoSungs, ...JungSungs, ...JongSungs].includes(text[cursor + 1])
          ) {
            if (
              cursor < ref.current!.value.length &&
              isChoSung(text[cursor + 1])
            ) {
              cursor += 1;
            }
            if (
              cursor < ref.current!.value.length &&
              isJungSung(text[cursor + 1])
            ) {
              cursor += 1;
            }
            if (
              cursor < ref.current!.value.length &&
              isJongSung(text[cursor + 1])
            ) {
              cursor += 1;
            }
          } else {
            cursor += 1;
          }
          cursor = Math.min(cursor + 1, ref.current!.value.length);
          ref.current!.setSelectionRange(cursor, cursor);
          break;
        }
      }
      keyState.leftCtrlKey = e.ctrlKey && e.location == 1;
      keyState.rightCtrlKey = e.ctrlKey && e.location == 2;
      keyState.leftShiftKey = e.shiftKey && e.location == 1;
      keyState.rightShiftKey = e.shiftKey && e.location == 2;
    } else if (
      e.key == "a" &&
      (metaKeyState || keyState.leftCtrlKey || keyState.rightCtrlKey)
    ) {
      ref.current?.select();
      return;
    }
    onChange(e as any, e.key);
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
      if (e.key == "Meta") {
        setMetaKeyState(false);
        return;
      }
      setKeyState({
        leftCtrlKey: e.ctrlKey && e.location == 1,
        rightCtrlKey:
          (e.ctrlKey && e.location == 2) || (e.metaKey && e.location == 2),
        leftShiftKey: e.shiftKey && e.location == 1,
        rightShiftKey: e.shiftKey && e.location == 2,
      });
    }
  };

  const changeKeyState = (key: keyof KeyStateType, isLock: boolean) => {
    if (isLock) {
      if (lockState[key]) {
        setButtonKeyState((prv) => {
          return {
            ...prv,
            [key]: false,
          };
        });
        setLockState((prv) => {
          return {
            ...prv,
            [key]: false,
          };
        });
      } else {
        setButtonKeyState((prv) => {
          return {
            ...prv,
            [key]: true,
          };
        });
        setLockState((prv) => {
          return {
            ...prv,
            [key]: true,
          };
        });
      }
    } else {
      if (buttonKeyState[key]) {
        setButtonKeyState((prv) => {
          return {
            ...prv,
            [key]: false,
          };
        });
        setLockState((prv) => {
          return {
            ...prv,
            [key]: false,
          };
        });
      } else {
        setButtonKeyState((prv) => {
          return {
            ...prv,
            [key]: true,
          };
        });
      }
    }
    ref.current?.focus();
  };

  return (
    <div id="landing-page">
      <h1>옛한글 입력기</h1>
      <div className="container">
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
            초성 125자 × 중성 95자 × 종성 138자 및 방점 (거성 〮, 상성 〯){" "}
            <br />※ 폰트에 따라 일부 문자는 다른 웹사이트에서 다르게 보여질 수
            있습니다.
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
        <div className="input-area">
          <textarea
            ref={ref}
            value={text}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          />
          <div className="button-container">
            {buttons.map((button, index) => (
              <div
                className={
                  "button " +
                  (buttonKeyState[button.attr] || keyState[button.attr]
                    ? "selected"
                    : "deselected")
                }
                key={"b" + index}
              >
                <div
                  className="left text"
                  onClick={() => changeKeyState(button.attr, false)}
                >
                  {button.text}
                </div>
                <div
                  className={
                    "right text " +
                    (lockState[button.attr] ? "selected" : "deselected")
                  }
                  onClick={() => changeKeyState(button.attr, true)}
                >
                  🔒
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
