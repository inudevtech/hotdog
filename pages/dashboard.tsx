import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AccountContext } from "./_app";

const dashboard = () => {
  const { AccountState } = useContext(AccountContext);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-2">
      {AccountState == null ? (
        <h1 className="text-3xl flex flex-col md:flex-row gap-4 items-center">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-red-500"
          />
          ダッシュボードを利用するにはログインをしてください。
        </h1>
      ) : (
        <div>
          <h2>ie-i</h2>
        </div>
      )}
    </div>
  );
};

export default dashboard;
