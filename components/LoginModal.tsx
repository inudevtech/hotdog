import { FC, FormEvent, useState } from "react";
import Image from "next/image";
import { login } from "../util/firebase/auth";
import Modal from "./Modal";
import SSOLogin from "./SSOLogin";

const loginModal: FC<{ setFlag: any; showFlag: boolean }> = ({
  setFlag,
  showFlag,
}) => {
  const [errMsg, setErrMsg] = useState("");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    login(0, elements[0].value, elements[1].value)
      .then(async (r) => {
        if (r.user.emailVerified) {
          setFlag(false);
          window.location.reload();
        } else {
          setErrMsg(
            "メール認証ができていません。\n届いているメールをご確認ください。"
          );
        }
      })
      .catch(() =>
        setErrMsg("ログインできませんでした。\n入力情報を確認してください。")
      );
  };

  return (
    <div>
      <Modal isOpen={showFlag} setOpen={setFlag}>
        <form
          className="m-5 mt-0 flex flex-col gap-2"
          onSubmit={submit}
        >
          <Image
            src="/logo.png"
            className="mx-auto"
            alt="ロゴ"
            width="300"
            height="200"
            objectFit="contain"
          />
          <h3 className="text-center text-xl">犬開発サービスにログイン</h3>
          <input
            type="email"
            placeholder="メールアドレス"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
          />
          <input
            type="password"
            placeholder="パスワード"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
          />
          <input
            type="submit"
            className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
            value="ログイン"
          />
          <SSOLogin setErrMsg={setErrMsg} />
          <p className="text-red-500 whitespace-pre-wrap">{errMsg}</p>
        </form>
      </Modal>
    </div>
  );
};

export default loginModal;
