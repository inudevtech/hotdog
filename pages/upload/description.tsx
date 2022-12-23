import { useRouter } from "next/router";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import EditModal from "../../components/EditModal";
import { AccountContext } from "../_app";

const Description = () => {
  const router = useRouter();
  const { AccountState } = useContext(AccountContext);
  const { id } = router.query;
  const [isOk, setIsOk] = useState<boolean>(false);
  const [saveFlag, setSaveFlag] = useState<boolean>(false);
  const drawRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (id === undefined) router.replace("/upload/");
    else if (AccountState === null)
      router.replace(
        { pathname: "/upload/complete", query: { id } },
        "/upload/complete"
      );
    else setIsOk(true);
  });

  useEffect(() => {
    if (!saveFlag && drawRef.current)
      router.replace(
        { pathname: "/upload/complete", query: { id } },
        "/upload/complete"
      );
  }, [saveFlag]);

  return (
    isOk && (
      <>
        <div className="pt-[120px] sm:pt-[100px] px-2 container m-auto mb-[150px]">
          <h1>ファイル情報の変更</h1>
          <EditModal
            isElement
            id={id as string}
            saveFlag={saveFlag}
            setSaveFlag={setSaveFlag}
          />
        </div>
        <div className="fixed items-center flex flex-col gap-2 bottom-0 left-0 w-screen backdrop-blur-sm bg-white/30 p-5 z-20">
          <button
            className="btn btn-block btn-primary"
            onClick={() => setSaveFlag(true)}
            type="button"
            ref={drawRef}
          >
            保存して次へ
          </button>
        </div>
      </>
    )
  );
};

export default Description;
