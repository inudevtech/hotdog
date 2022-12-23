import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FC, FormEvent, useState } from "react";
import Image from "next/image";
import { signUp } from "../util/firebase/auth";
import Modal from "./Modal";
import SSOLogin from "./SSOLogin";

const signUpModal: FC<{ showFlag: boolean; setFlag: any }> = ({
  showFlag,
  setFlag,
}) => {
  const [errMsg, setErrMsg] = useState<string>("");
  const [state, setState] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    setLoading(true);
    signUp(0, elements[0].value, elements[1].value, elements[2].value)
      .then(async () => {
        setState(false);
        setErrMsg(
          "仮登録処理が完了しました。\nメールを確認して本登録処理を完了してください。\n本登録が完了するまでログインすることはできません。"
        );
      })
      .catch(() => {
        setState(true);
        setErrMsg(
          "登録ができませんでした。\n既に登録されているメールアドレスが入力されていないかを確認してください。"
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <Modal isOpen={showFlag} setOpen={setFlag}>
        <form className="m-5 mt-0 flex flex-col gap-2" onSubmit={submit}>
          <Image
            src="/logo.png"
            alt="ロゴ"
            className="mx-auto"
            width="300"
            height="200"
            objectFit="contain"
          />
          <h3 className="text-center text-xl">犬開発アカウントを作成</h3>
          <input
            type="email"
            placeholder="メールアドレス"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
            required
          />
          <input
            type="text"
            placeholder="ニックネーム"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
            required
          />

          {state === null || state ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin px-2"
                  />
                ) : null}
                アカウントを作成
              </button>
              <SSOLogin setErrMsg={setErrMsg} />
            </>
          ) : null}
          <p className={`whitespace-pre-wrap ${state ? "text-red-500" : ""}`}>
            {errMsg}
          </p>
          {state === false ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setFlag()}
            >
              画面を閉じる
            </button>
          ) : null}
        </form>
      </Modal>
    </div>
  );
};

export default signUpModal;
