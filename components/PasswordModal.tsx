import { FC, FormEvent, useState } from "react";
import { resetPassword } from "../util/firebase/auth";
import Modal from "./Modal";

const resetPasswordModal: FC<{ setFlag: any; showFlag: boolean }> = ({
  setFlag,
  showFlag,
}) => {
  const [errMsg, setErrMsg] = useState<string>("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    try {
      await resetPassword(elements[0].value);
      setErrMsg(
        "パスワード再設定用のメールを送信しました。\nメール内URLよりパスワードを再設定してください。"
      );
    } catch {
      setErrMsg("エラーが発生しました。\n入力情報をお確かめください。");
    }
  };
  return (
    <Modal isOpen={showFlag} setOpen={setFlag} className="p-5">
      <form className="flex flex-col gap-2" onSubmit={submit}>
        <h2>パスワードの再設定</h2>
        <p>
          入力したメールアドレスにパスワード再設定用のリンクを添付したメールを送信します。
        </p>
        <input
          type="email"
          placeholder="メールアドレス"
          className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
        />
        <input
          type="submit"
          className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
          value="送信"
        />
      </form>
      <p className="text-red-500 whitespace-pre-wrap">{errMsg}</p>
    </Modal>
  );
};

export default resetPasswordModal;
