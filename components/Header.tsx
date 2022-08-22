import { useState } from 'react';
import { logout } from '../util/firebase/auth';
import { AccountContext } from '../pages/_app';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Header = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <AccountContext.Consumer>
      {(value) => (
        <>
          <header className="fixed top-0 w-screen flex p-2 justify-between items-center shadow border-slate-200 border flex-wrap">
            <p className="text-2xl">🌭ホットドッグ</p>
            {value.AccountState == null ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block text-center"
                >
                  ログイン
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpOpen(true)}
                  className="transition p-1 border border-blue-400 rounded-md hover:shadow-lg hover:border-blue-500 block text-center bg-blue-300"
                >
                  アカウントを作成
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logout(true)}
                className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block text-center"
              >
                ログアウト
              </button>
            )}
          </header>
          <LoginModal showFlag={loginOpen} setFlag={setLoginOpen} />
          <SignupModal showFlag={signUpOpen} setFlag={setSignUpOpen} />
        </>
      )}
    </AccountContext.Consumer>
  );
};

export default Header;
