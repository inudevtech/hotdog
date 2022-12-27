import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactElement, useContext, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import FileItem from "../components/FileItem";
import { addRelations } from "../util/util";
import { AccountContext } from "./_app";

const Dashboard = () => {
  const { AccountState } = useContext(AccountContext);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [fileList, setFileList] = useState<ReactElement[]>([]);

  useEffect(() => {
    addRelations(
      0,
      { isAnonymous: false, isDeletedUser: false },
      setHasMore,
      fileList,
      setFileList,
      AccountState?.uid!,
      true
    );
  }, []);

  return (
    <div
      className={`relative flex flex-col items-center h-screen p-2 container mx-auto ${
        AccountState == null ? "justify-center" : "pt-[100px]"
      }`}
    >
      {AccountState == null ? (
        <h1 className="text-3xl flex flex-col md:flex-row gap-4 items-center justify-center">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-red-500"
          />
          ダッシュボードを利用するにはログインをしてください。
        </h1>
      ) : (
        <>
          <FileItem />
          {fileList.length === 0 && <div>ここには何もありません😢</div>}
        </>
      )}
    </div>
  );
};

export default Dashboard;
