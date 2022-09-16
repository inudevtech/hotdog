import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useRouter } from "next/router";
import { Dispatch, FC, SetStateAction, useContext, useState } from "react";
import { AccountContext } from "../pages/_app";
import Modal from "./Modal";

const removeModal: FC<{
  id: string;
  flag: [boolean, Dispatch<SetStateAction<boolean>>];
}> = ({ id, flag }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);
  const { AccountState } = useContext(AccountContext);
  const router = useRouter();

  const remove = async () => {
    setLoading(true);
    const token = await AccountState?.getIdToken();
    axios.post("/api/remove", null, { params: { id, token } }).then(() => {
      setLoading(false);
      setIsRemoved(true);
    });
  };

  return (
    <Modal isOpen={flag[0]} setOpen={flag[1]} className="p-5">
      {isRemoved ? (
        <>
          <h1 className="text-3xl p-2">削除が完了しました。</h1>
          <p className="text-sm">
            システムの仕様上最大１日程度アクセスできる可能性があります。
          </p>
          <button
            type="button"
            className="transition p-1 my-2 min-w-[300px] w-full lg:min-w-0 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
            onClick={() => router.push("/")}
          >
            ホームに戻る
          </button>
        </>
      ) : (
        <>
          <h1 className="text-3xl p-2">本当に削除しますか？</h1>
          <p className="text-red-500 text-xl">この操作は元に戻せません！</p>
          <p className="text-sm">
            システムの仕様上削除までに時間がかかる場合があります。
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="transition p-1 my-2 min-w-[300px] w-full lg:min-w-0 border border-sky-100 rounded-md hover:shadow-lg hover:border-red-600 block text-center bg-red-400"
              onClick={remove}
            >
              {loading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin px-2"
                />
              ) : null}
              削除
            </button>
            <button
              type="button"
              className="transition p-1 my-2 min-w-[300px] w-full lg:min-w-0 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
              onClick={() => flag[1](false)}
            >
              キャンセル
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default removeModal;
