import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import FileItem from "../components/FileItem";
import { AccountContext } from "./_app";

const Dashboard = () => {
  const { AccountState } = useContext(AccountContext);

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
        <FileItem uid={AccountState.uid} />
      )}
    </div>
  );
};

export default Dashboard;
