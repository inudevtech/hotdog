import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactElement, useContext, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { addRelations } from "../util/util";
import { AccountContext } from "./_app";

const dashboard = () => {
  const { AccountState } = useContext(AccountContext);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [fileList, setFileList] = useState<ReactElement[]>([]);

  useEffect(() => {
    addRelations(
      0,
      { isAnonymous: false, isDeletedUser: false },
      AccountState?.uid!,
      setHasMore,
      fileList,
      setFileList,
      true
    );
  }, []);

  return (
    <div
      className={`relative flex flex-col items-center h-screen p-2 container mx-auto xl:max-w-5xl ${
        AccountState == null ? "justify-center" : "pt-[100px]"
      }`}
    >
      {AccountState == null ? (
        <h1 className="text-3xl flex flex-col md:flex-row gap-4 items-center">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-red-500"
          />
          ダッシュボードを利用するにはログインをしてください。
        </h1>
      ) : (
        <>
          <InfiniteScroll
            loadMore={(page) =>
              addRelations(
                page,
                { isAnonymous: false, isDeletedUser: false },
                AccountState?.uid,
                setHasMore,
                fileList,
                setFileList,
                true
              )
            } // 項目を読み込む際に処理するコールバック関数
            hasMore={hasMore} // 読み込みを行うかどうかの判定
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[90%] mx-auto overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 150px)" }}
            loader={
              <div className="text-2xl" key={0}>
                読み込み中...
              </div>
            }
          >
            {fileList}
          </InfiniteScroll>
          {fileList.length === 0 && <div>ここには何もありません😢</div>}
        </>
      )}
    </div>
  );
};

export default dashboard;
