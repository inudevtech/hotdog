import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Component, FormEvent } from 'react';
import Image from 'next/image';
import { login } from '../util/firebase/auth';

interface ModalProps {
  showFlag: boolean,
  setFlag: any,
}

interface LoginStateProps {
  errMsg: string
}

class loginModal extends Component<ModalProps, LoginStateProps> {
  constructor(props: ModalProps | Readonly<ModalProps>) {
    super(props);
    this.state = {
      errMsg: '',
    };
  }

  submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    login(elements[0].value, elements[1].value)
      .then(async (r) => {
        if (r.user.emailVerified) {
          const { setFlag } = this.props;
          setFlag(false);
          window.location.reload();
        } else {
          this.setState({ errMsg: 'メール認証ができていません。\n届いているメールをご確認ください。' });
        }
        // Cookies.set('access_token', await r.user.getIdToken(true));
      })
      .catch(() => this.setState({ errMsg: 'ログインできませんでした。\n入力情報を確認してください。' }));
  }

  render() {
    const { showFlag, setFlag } = this.props;
    const { errMsg } = this.state;
    return (
      <div>
        {showFlag ? (
          <div className="fixed top-0 left-0 w-full h-full bg-stone-500/50 flex items-center justify-center z-50">
            <div className="bg-white rounded">
              <FontAwesomeIcon
                icon={faXmark}
                onClick={() => setFlag()}
                className="block mr-0 ml-auto p-1 cursor-pointer"
              />
              <form className="m-5 mt-0 flex flex-col gap-2" onSubmit={this.submit.bind(this)}>
                <Image src="/logo.png" className="mx-auto" alt="ロゴ" width="300" height="200" objectFit="contain" />
                <h3 className="text-center text-xl">犬開発サービスにログイン</h3>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
                />
                <input
                  type="password"
                  placeholder="パスワード"
                  className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
                />
                <input
                  type="submit"
                  className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
                  value="ログイン"
                />
                <p className="text-red-500 whitespace-pre-wrap">
                  {errMsg}
                </p>
              </form>
            </div>
          </div>
        )
          : <div />}
      </div>
    );
  }
}

export default loginModal;
