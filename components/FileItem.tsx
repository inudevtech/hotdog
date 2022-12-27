import { ReactElement, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { addRelations } from "../util/util";

const FileItem = () => {
  // eslint-disable-next-line no-undef
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [fileList, setFileList] = useState<ReactElement[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const scrollRef = useRef<InfiniteScroll>(null);

  useEffect(() => {
    console.log(fileList.length);
    // @ts-ignore
    scrollRef.current!.pageLoaded = 0;
    addRelations(
      0,
      { isAnonymous: false, isDeletedUser: false },
      setHasMore,
      fileList,
      setFileList,
      undefined,
      undefined,
      searchText,
      []
    );
  }, [searchText]);

  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        検索
        <input
          type="input"
          className="input input-bordered w-64"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <InfiniteScroll
        loadMore={(page) =>
          addRelations(
            page,
            { isAnonymous: false, isDeletedUser: false },
            setHasMore,
            fileList,
            setFileList,
            undefined,
            undefined,
            searchText
          )
        } // 項目を読み込む際に処理するコールバック関数
        hasMore={hasMore} // 読み込みを行うかどうかの判定
        className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 p-2"
        style={{ maxHeight: "calc(100vh - 150px)" }}
        loader={
          <div className="text-2xl" key={0}>
            読み込み中...
          </div>
        }
        threshold={400}
        ref={scrollRef}
      >
        {fileList}
      </InfiniteScroll>
    </>
  );
};

export default FileItem;
