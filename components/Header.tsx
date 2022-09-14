import { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  faArrowUpRightFromSquare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import { useRouter } from "next/router";
import { logout } from "../util/firebase/auth";
import { AccountContext } from "../pages/_app";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light-border.css";

const Header = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const { AccountState } = useContext(AccountContext);
  const router = useRouter();

  let icon;
  if (AccountState?.photoURL) {
    icon = (
      <img
        src={AccountState?.photoURL}
        alt="アイコン"
        width="32"
        height="32"
        className="rounded-full"
      />
    );
  } else {
    icon = (
      <FontAwesomeIcon
        icon={faUser}
        className="bg-black rounded-full px-[9px] py-[8px]"
        color="#fff"
      />
    );
  }

  const tooltipContent = (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xl">{AccountState?.displayName}</span>
      </div>
      <button
        type="button"
        onClick={() => router.push("https://account.inu-dev.tech/")}
        className="transition border p-1.5 border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400 flex items-center gap-2"
      >
        アカウント情報の変更
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
      </button>
      <button
        type="button"
        onClick={() => logout(true)}
        className="transition border p-1.5 border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
      >
        ログアウト
      </button>
    </div>
  );

  return (
    <>
      <header className="fixed top-0 w-screen flex p-2 justify-between items-center shadow-lg border-slate-200 border flex-wrap bg-white z-10">
        <Link href="/">
          <div className="text-2xl flex gap-1 items-center cursor-pointer">
            <Image
              src="/hotdog-emoji.svg"
              width="25"
              height="25"
              alt="Hotdog Emoji"
              className=""
            />
            <span className="item">ホットドッグ</span>
          </div>
        </Link>
        {AccountState == null ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="transition p-2 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block text-center"
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => setSignUpOpen(true)}
              className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
            >
              アカウントを作成
            </button>
          </div>
        ) : (
          <Tippy
            content={tooltipContent}
            trigger="click"
            interactive
            theme="light-border"
          >
            <div className="cursor-pointer">{icon}</div>
          </Tippy>
        )}
      </header>
      <LoginModal showFlag={loginOpen} setFlag={setLoginOpen} />
      <SignupModal showFlag={signUpOpen} setFlag={setSignUpOpen} />
    </>
  );
};

export default Header;
