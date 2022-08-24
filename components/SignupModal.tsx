import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Component, FormEvent } from 'react';
import Image from 'next/image';
import { signUp } from '../util/firebase/auth';

interface ModalProps {
  showFlag: boolean,
  setFlag: any,
}

interface LoginStateProps {
  errMsg: string,
  state: boolean|null,
  loading: boolean
}

class loginModal extends Component<ModalProps, LoginStateProps> {
  constructor(props: ModalProps | Readonly<ModalProps>) {
    super(props);
    this.state = {
      errMsg: '',
      state: null,
      loading: false,
    };
  }

  submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    this.setState({ loading: true });
    signUp(elements[0].value, elements[1].value, elements[2].value)
      .then(async () => {
        this.setState({ state: false, errMsg: '仮登録処理が完了しました。\nメールを確認して本登録処理を完了してください。\n本登録が完了するまでログインすることはできません。' });
      })
      .catch(() => this.setState({ state: true, errMsg: '登録ができませんでした。\n入力情報を確認してください。' }))
      .finally(() => this.setState({ loading: false }));
  }

  render() {
    const { showFlag, setFlag } = this.props;
    const { errMsg, loading, state } = this.state;
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
                <Image src="/logo.png" alt="ロゴ" className="mx-auto" width="300" height="200" objectFit="contain" />
                <h3 className="text-center text-xl">犬開発アカウントを作成</h3>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
                  required
                />
                <input
                  type="password"
                  placeholder="パスワード"
                  className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
                  required
                />
                <input
                  type="text"
                  placeholder="ニックネーム"
                  className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
                  required
                />

                {state === null ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
                  >
                    {loading ? (<FontAwesomeIcon icon={faSpinner} className="animate-spin px-2" />) : null}
                    アカウントを作成
                  </button>
                ) : null}
                <p className={`whitespace-pre-wrap${state ? 'text-red-500' : ''}`}>
                  {errMsg}
                </p>
                {state === false ? (
                  <button
                    type="button"
                    className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block text-center"
                    onClick={() => setFlag()}
                  >
                    画面を閉じる
                  </button>
                ) : null}
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
