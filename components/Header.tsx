import { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  faArrowUpRightFromSquare,
  faBars,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import { useRouter } from "next/router";
// @ts-ignore
import Menu from "react-burger-menu/lib/menus/scaleDown";
import { logout } from "../util/firebase/auth";
import { AccountContext } from "../pages/_app";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light-border.css";
import packageJson from "../package.json";

const Header = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
        className="btn btn-primary gap-2"
      >
        アカウント情報の変更
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
      </button>
      <button
        type="button"
        onClick={() => logout(true)}
        className="btn btn-primary"
      >
        ログアウト
      </button>
    </div>
  );

  const link = (
    <Link href="/">
      <div
        className="text-2xl flex gap-1 items-center cursor-pointer"
        onClick={() => setIsOpen(false)}
        aria-hidden
      >
        <Image
          src="/hotdog-emoji.svg"
          width="25"
          height="25"
          alt="Hotdog Emoji"
        />
        <span className="item">ホットドッグ</span>
      </div>
    </Link>
  );

  return (
    <>
      <header className="fixed top-0 w-screen flex p-2 justify-between items-center shadow-lg border-slate-200 border flex-wrap bg-white z-30">
        <div className="flex flex-row items-center gap-4 py-1">
          <Menu
            customBurgerIcon={<FontAwesomeIcon icon={faBars} />}
            outerContainerId="__next"
            pageWrapId="page-warp"
            isOpen={isOpen}
            onStateChange={(state: any) => setIsOpen(state.isOpen)}
          >
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-start gap-4 grow">
                {link}
                <Link href="/dashboard">
                  <span
                    className={`cursor-pointer header_menu ${
                      router.pathname === "/dashboard" ? "active" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                    aria-hidden
                  >
                    ダッシュボード
                  </span>
                </Link>
                <Link href="/">
                  <span
                    className={`cursor-pointer header_menu ${
                      router.pathname.startsWith("/d/") ? "active" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                    aria-hidden
                  >
                    ダウンロード
                  </span>
                </Link>
                <Link href="https://www.inu-dev.tech/hotdog">
                  <span
                    className="cursor-pointer header_menu flex gap-2 items-center"
                    onClick={() => setIsOpen(false)}
                    aria-hidden
                  >
                    ホットドッグについて
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </span>
                </Link>
                <Link href="https://forms.gle/b8ED6GkTkn9RMocQ6">
                  <span
                    className="cursor-pointer header_menu flex gap-2 items-center"
                    onClick={() => setIsOpen(false)}
                    aria-hidden
                  >
                    お問い合わせ
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </span>
                </Link>
              </div>
              <div className="grow-none">
                <Link href="/static/changelog">
                  <span onClick={() => setIsOpen(false)} aria-hidden>
                    ver {packageJson.version} |{" "}
                    <span className="text-blue-500 underline cursor-pointer">
                      チェンジログ
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </Menu>
          {link}
        </div>
        {AccountState == null ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="btn btn-primary"
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => setSignUpOpen(true)}
              className="btn btn-outline"
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
