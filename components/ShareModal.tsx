import Tippy from "@tippyjs/react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import Modal from "./Modal";

const ShareModal: FC<{
  showFlag: boolean;
  setFlag: Dispatch<SetStateAction<boolean>>;
  id: string;
}> = ({ showFlag, setFlag, id }) => {
  const [canShare, setCanShare] = useState<boolean>(false);

  useEffect(() => {
    setCanShare(!!navigator.canShare);
  }, []);

  const share = () => {
    navigator.share({
      title: "ホットドッグでファイルを共有しました！",
      url: `https://hotdog.inu-dev.tech/d/${id}`,
    });
  };

  return (
    <Modal isOpen={showFlag} setOpen={setFlag} className="sm:max-w-sm pt-10">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-2xl font-bold p-3">共有方法を選択</h1>
        {canShare && (
          <button
            className="btn btn-primary grow btn-block"
            type="button"
            onClick={share}
          >
            共有
          </button>
        )}
        <Tippy
          content="リンクをクリップボードにコピーしました!"
          trigger="click"
        >
          <button
            className="btn btn-outline grow btn-block"
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(
                `https://hotdog.inu-dev.tech/d/${id}`
              )
            }
          >
            ダウンロードリンクをコピー
          </button>
        </Tippy>
      </div>
    </Modal>
  );
};

export default ShareModal;
