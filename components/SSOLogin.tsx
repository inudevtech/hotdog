import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  //   faTwitter,
  faGithub,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Dispatch, FC, SetStateAction } from "react";
import { login } from "../util/firebase/auth";

const loginComponent: FC<{ setErrMsg: Dispatch<SetStateAction<string>> }> = ({
  setErrMsg,
}) => (
  <>
    <div
      className="btn btn-primary gap-2"
      onClick={async () => {
        login(1)
          .then(() => window.location.reload())
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\n既に使用されているメールアドレスで登録をしようとしている可能性があります。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faGoogle} size="xl" />
      <p>Login with Google</p>
    </div>
    <div
      className="btn btn-primary gap-2"
      onClick={async () => {
        login(2)
          .then(() => window.location.reload())
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\n既に使用されているメールアドレスで登録をしようとしている可能性があります。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faTwitter} size="xl" />
      <p>Login with Twitter</p>
    </div>
    <div
      className="btn btn-primary gap-2"
      onClick={async () => {
        login(3)
          .then(() => window.location.reload())
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\n既に使用されているメールアドレスで登録をしようとしている可能性があります。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faGithub} size="xl" />
      <p>Login with Github</p>
    </div>
  </>
);

export default loginComponent;
