import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import axios from 'axios';
import { faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Prism from 'prismjs';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroller';
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
  const [isExists, setIsExists] = useState<boolean|null|undefined>(null);
  const [description, setDescription] = useState<string|null>(null);
  const [user, setUser] = useState<GetUserProps|null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, sethasMore] = useState<boolean>(false);
  const [fileList, setFileList] = useState<ReactElement[]>([]);

  function addRelations(page: number) {
    if (!user?.isAnonymous) {
      axios.get('/api/get', { params: { id: router.query.id, index: page * 3 } }).then((r) => {
        if (r.data.length === 3) {
          sethasMore(true);
        } else if (r.data.length === 0) {
          sethasMore(false);
        }

        setFileList([...fileList, r.data.map((file: {
          id: string,
          fileName: string,
          displayName: string,
          description: string
        }, index: number) => {
          const output = document.createElement('div');
          output.innerHTML = `<div>${file.description}</div>`;
          Prism.highlightAllUnder(output);
          if (output.innerHTML === '<div>null</div>') {
            output.innerHTML = "<div class='italic'>このファイルに説明はありません。</div>";
          }

          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className="p-5 flex flex-col border border-slate-300 rounded-xl" key={fileList.length + index + 1}>
              {file.displayName ? (
                <>
                  <h2 className="text-2xl leading-5">{file.displayName}</h2>
                  <pre className="italic text-sm">{file.fileName}</pre>
                </>
              ) : (
                <>
                  <p className="text-2xl leading-5">{file.fileName}</p>
                  <pre className="italic text-sm">タイトルはありません。</pre>
                </>
              )}
              <div className="border-t-2 mt-2 relative">
                <div
                  dangerouslySetInnerHTML={{ __html: output.innerHTML }}
                  className="h-[200px] overflow-hidden mt-2 p-1"
                />
                <div className="gradient absolute w-full mt-2 p-1 top-0 h-[200px]" />
                <a
                  href={`/d/${file.id}`}
                  className="transition p-1 px-5 absolute top-[150px] w-[90%] right-[5%] border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
                >
                  詳細を見る
                </a>
              </div>
            </div>
          );
        })]);
      });
    }
  }

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

            addRelations(0);
          }
        }).catch(() => {
          setIsExists(undefined);
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
    // コンポーネントの再レンダリング時にシンタックスハイライトを実行
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
          : <div dangerouslySetInnerHTML={{ __html: output.innerHTML }} className="border-t-2 mt-2 p-1 overflow-auto" />}
        <button
          type="button"
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
      <>
        <p>
          お探しのファイルが見つかりませんでした。
          <br />
          URLが不正か既に削除されたファイルの可能性があります。
          <br />
          共有者にご確認ください。
        </p>
        <p className="text-red-500">
          ※ログインしていない状態でアップロードされたファイルは7日後に自動的に削除されます！
        </p>
      </>
    );
  } else if (isExists === undefined) {
    showItem = (
      <p>
        不明なエラーが発生しました。
        <br />
        時間をおいて再度お試しください。
        <br />
        何度もエラーが発生する場合はサポートにご連絡ください。
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
        <div className="shadow-xl p-5 flex flex-col border border-slate-300 rounded-xl max-h-[70%]">
          {showItem}
        </div>
      </div>
      <div className="container xl:max-w-5xl mx-auto relative top-[-150px]">
        <h2 className="text-2xl text-center m-2">
          {user?.displayName}
          さんの他のファイル
        </h2>
        <InfiniteScroll
          loadMore={(page) => addRelations(page)} // 項目を読み込む際に処理するコールバック関数
          hasMore={hasMore} // 読み込みを行うかどうかの判定
          loader={<div className="text-2xl" key={0}>読み込み中...</div>}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fileList}
          </div>
        </InfiniteScroll>
      </div>
    </>
  );
};

export default download;
