import { useRouter } from "next/router";
import { useContext, useState } from "react";
import EditModal from "../../components/EditModal";
import { AccountContext } from "../_app";

const Description = () => {
  const router = useRouter();
  const { AccountState } = useContext(AccountContext);
  const { id } = router.query;
  const [isOk, setIsOk] = useState<boolean>(false);

  if (id === undefined) router.replace("/upload/");
  else if (AccountState === null)
    router.replace(
      { pathname: "/upload/complete", query: { id } },
      "/upload/complete"
    );
  else setIsOk(true);

  return (
    isOk && (
      <div className="pt-[120px] sm:pt-[100px] px-2">
        <EditModal isElement id={id as string} />
      </div>
    )
  );
};

export default Description;
