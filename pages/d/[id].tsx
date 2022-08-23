import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Prism from 'prismjs';
import Image from 'next/image';
import Header from '../../components/Header';

interface GetUserProps {
  isAnonymous: boolean,
  iconURL?: string,
  displayName?: string,
}

const download = () => {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [title, setTitle] = useState<string|null>(null);
  const [fileName, setFileName] = useState<string|null>(null);
  const [isExists, setIsExists] = useState<boolean|null>(null);
  const [description, setDescription] = useState<string|null>(null);
  const [user, setUser] = useState<GetUserProps|null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // コンポーネントの再レンダリング時にシンタックスハイライトを実行

  useEffect(() => {
    // idがundefinedにならないようにする
    if (router.isReady) {
      const { id } = router.query;

      if (id) {
        axios.get('/api/get', { params: { id } }).then((res) => {
          setIsExists(res.data.exists);
          if (res.data.exists) {
            setTitle(res.data.displayName);
            setDescription(res.data.description);
            setFileName(res.data.fileName);
            setUser(res.data.user);
          }
        });
      } else {
        setIsExists(false);
      }
    }
  }, [router]);

  let showItem;

  const downloadFile = () => {
    setLoading(true);
    // Recaptcha認証を行う
    if (executeRecaptcha) {
      executeRecaptcha!('download').then((token) => {
        const { id } = router.query;
        axios.get('/api/download', { params: { id, recaptcha: token } }).then((res) => {
          const link = document.createElement('a');
          link.download = fileName!;
          link.href = res.data.url;
          link.click();
          link.remove();
          setLoading(false);
        });
      });
    }
  };

  if (isExists) {
    const output = document.createElement('div');
    output.innerHTML = `<div>${description}</div>`;
    Prism.highlightAllUnder(output);

    showItem = (
      <>
        <p className="mb-3 flex items-center gap-1">
          {user?.iconURL ? <Image src={user?.iconURL} alt="アイコン" width="30" height="30" className="rounded-full" /> : <FontAwesomeIcon icon={faUser} className="bg-black rounded-full px-[4px] py-[3px]" color="#fff" />}
          {user?.isAnonymous ? '匿名ユーザー' : user?.displayName}
        </p>
        {title ? (
          <>
            <h2 className="text-2xl leading-5">{title}</h2>
            <pre className="italic text-sm">{fileName}</pre>
          </>
        ) : (
          <>
            <p className="text-2xl leading-5">{fileName}</p>
            <pre className="italic text-sm">タイトルはありません。</pre>
          </>
        )}
        {output.innerHTML === '<div>null</div>' ? null
          // eslint-disable-next-line react/no-danger
          : <p dangerouslySetInnerHTML={{ __html: output.innerHTML }} className="border-t-2 mt-2 p-1" />}
        <button
          type="submit"
          className="transition p-1 my-2 min-w-[300px] border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
          onClick={downloadFile}
        >
          {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin px-2" /> : null}
          ダウンロード
        </button>
      </>
    );
  } else if (isExists === false) {
    showItem = (
      <p>
        お探しのファイルが見つかりませんでした。
        <br />
        URLが不正か既に削除されたファイルの可能性があります。
        <br />
        共有者にご確認ください。
      </p>
    );
  } else {
    showItem = (
      <p>
        <FontAwesomeIcon icon={faSpinner} className="animate-spin px-2" />
        読み込み中
      </p>
    );
  }

  return (
    <>
      <Header />
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="shadow-xl p-5 flex flex-col border border-slate-300 rounded-xl">
          {showItem}
        </div>
      </div>
    </>
  );
};

export default download;
