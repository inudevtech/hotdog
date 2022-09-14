import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import {
  faCircleInfo,
  faDownload,
  faFontAwesome,
  faHeart,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Prism from "prismjs";
import InfiniteScroll from "react-infinite-scroller";
import { parseCookies, setCookie } from "nookies";
import Tippy from "@tippyjs/react";
import Header from "../../components/Header";
import "tippy.js/dist/tippy.css";

interface GetUserProps {
  isAnonymous: boolean;
  iconURL?: string;
  displayName?: string;
}

const download = () => {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [title, setTitle] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExists, setIsExists] = useState<boolean | null | undefined>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [user, setUser] = useState<GetUserProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, sethasMore] = useState<boolean>(false);
  const [isIcon, setIsIcon] = useState<boolean>(false);
  const [fileList, setFileList] = useState<ReactElement[]>([]);
  const [like, setLike] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [downloadCount, setDownloadCount] = useState<number>(0);

  function addRelations(page: number, u: GetUserProps | null) {
    if (!u?.isAnonymous) {
      axios
        .get("/api/get", { params: { id: router.query.id, index: page * 3 } })
        .then((r) => {
          if (r.data.length === 3) {
            sethasMore(true);
          } else if (r.data.length === 0) {
            sethasMore(false);
          }

          setFileList([
            ...fileList,
            r.data.map(
              (
                file: {
                  id: string;
                  fileName: string;
                  displayName: string;
                  description: string;
                },
                index: number
              ) => {
                const output = document.createElement("div");
                output.innerHTML = `<div>${file.description}</div>`;
                Prism.highlightAllUnder(output);
                if (output.innerHTML === "<div>null</div>") {
                  output.innerHTML =
                    "<div class='italic'>このファイルに説明はありません。</div>";
                }

                return (
                  <div
                    className="p-5 flex flex-col border border-slate-300 rounded-xl"
                    // eslint-disable-next-line react/no-array-index-key
                    key={fileList.length + index + 1}
                  >
                    {file.displayName ? (
                      <>
                        <h2 className="text-2xl leading-5 truncate">
                          {file.displayName}
                        </h2>
                        <pre className="italic text-sm truncate">
                          {file.fileName}
                        </pre>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl leading-5 truncate">
                          {file.fileName}
                        </p>
                        <pre className="italic text-sm">
                          タイトルはありません。
                        </pre>
                      </>
                    )}
                    <div className="border-t-2 mt-2 relative">
                      <div
                        dangerouslySetInnerHTML={{ __html: output.innerHTML }}
                        className="h-[200px] overflow-hidden mt-2 p-1 break-words"
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
              }
            ),
          ]);
        });
    }
  }

  useEffect(() => {
    const { id } = router.query;
    setLike(parseCookies().like === "1");

    if (id) {
      axios
        .get("/api/get", { params: { id } })
        .then((res) => {
          setIsExists(res.data.exists);
          if (res.data.exists) {
            setTitle(res.data.displayName);
            setDescription(res.data.description);
            setFileName(res.data.fileName);
            setIsIcon(res.data.icon);
            setLikeCount(res.data.favorite);
            setDownloadCount(res.data.download);
            let u: GetUserProps | null;
            if (res.data.user.isDeletedUser) {
              u = {
                isAnonymous: false,
                iconURL: undefined,
                displayName: "削除済みユーザー",
              };
            } else {
              u = res.data.user;
            }

            setUser(u);
            addRelations(0, u);
          }
        })
        .catch(() => {
          setIsExists(undefined);
        });
    } else {
      setIsExists(false);
    }
  }, [router]);

  let showItem;

  const downloadFile = () => {
    setLoading(true);
    // Recaptcha認証を行う
    if (executeRecaptcha) {
      executeRecaptcha!("download").then((token) => {
        const { id } = router.query;
        axios
          .get("/api/download", { params: { id, recaptcha: token } })
          .then((res) => {
            const link = document.createElement("a");
            link.download = fileName!;
            link.href = res.data.url;
            link.click();
            link.remove();
            setLoading(false);
          });
      });
    }
  };

  const toggleLike = () => {
    executeRecaptcha!("favorite").then(async (token) => {
      const { id } = router.query;
      const type = parseCookies().like === "1" ? "0" : "1";
      setCookie(null, "like", type, {
        maxAge: 60 * 60 * 24 * 365 * 100,
        path: `/d/${id}`,
      });
      await axios.post("/api/favorite", null, {
        params: { id, type, recaptcha: token },
      });
      setLike(parseCookies().like === "1");
      setLikeCount((prev) => (type === "1" ? prev + 1 : prev - 1));
    });
  };

  const report = () => {
    router.push(
      `https://docs.google.com/forms/d/e/1FAIpQLSeeGS0tST9HROEDAJCpMb1DBbKBzQ6xQyJYHOgmqZDmZkKstw/viewform?usp=pp_url&entry.1778469610=利用規約等に違反しているファイルがアップロードされている&entry.1885650888=${router.query.id}`
    );
  };

  if (isExists) {
    // コンポーネントの再レンダリング時にシンタックスハイライトを実行
    const output = document.createElement("div");
    output.innerHTML = `<div>${description}</div>`;
    Prism.highlightAllUnder(output);

    const userElement = (
      <p className="mb-3 flex items-center gap-1">
        {user?.iconURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user?.iconURL}
            alt="アイコン"
            width="26"
            height="26"
            className="rounded-full"
          />
        ) : (
          <FontAwesomeIcon
            icon={faUser}
            className="bg-black rounded-full px-[6px] py-[5px]"
            color="#fff"
          />
        )}
        {user?.isAnonymous ? "匿名ユーザー" : user?.displayName}
      </p>
    );

    showItem = (
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:min-w-[250px]">
          <div className="lg:hidden">{userElement}</div>
          {title ? (
            <>
              <h2 className="text-2xl leading-6 truncate">{title}</h2>
              <pre className="italic text-sm truncate">{fileName}</pre>
            </>
          ) : (
            <>
              <p className="text-2xl leading-6 truncate">{fileName}</p>
              <pre className="italic text-sm truncate">
                タイトルはありません。
              </pre>
            </>
          )}
          {isIcon ? (
            <p className="bg-blue-300/[.6] rounded border border-blue-400 p-2 my-2">
              <FontAwesomeIcon icon={faCircleInfo} className="px-2" />
              これは
              {user?.displayName}
              さんのユーザーアイコンです。
            </p>
          ) : null}
          {output.innerHTML === "<div>null</div>" ? null : (
            // eslint-disable-next-line react/no-danger
            <div
              dangerouslySetInnerHTML={{ __html: output.innerHTML }}
              className="border-t-2 mt-2 p-1 overflow-auto break-words"
            />
          )}
        </div>
        <div className="justify-between flex flex-col min-w-[250px] flex-grow">
          <div className="hidden lg:block">{userElement}</div>
          <div>
            <div className="flex flex-row justify-around items-center">
              <Tippy
                content={like ? "いいねありがとうございます！" : "いいねの数"}
              >
                <div className="flex flex-row items-center gap-2">
                  <FontAwesomeIcon
                    icon={faHeart}
                    onClick={toggleLike}
                    className={`border hover:shadow-lg cursor-pointer p-[10px] rounded-full transition ${
                      like
                        ? " text-red-500 hover:text-red-400"
                        : "text-slate-400 hover:text-slate-500"
                    }`}
                  />
                  {likeCount}
                </div>
              </Tippy>
              <Tippy content="ダウンロード数">
                <div className="flex flex-row items-center gap-2">
                  <FontAwesomeIcon
                    icon={faDownload}
                    size="lg"
                    className="text-slate-400"
                  />
                  {downloadCount}
                </div>
              </Tippy>
              <Tippy content="このファイルを報告">
                <FontAwesomeIcon
                  icon={faFontAwesome}
                  onClick={report}
                  className="text-slate-300 cursor-pointer"
                />
              </Tippy>
            </div>
            <button
              type="button"
              className="transition p-1 my-2 min-w-[300px] w-full lg:min-w-0 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
              onClick={downloadFile}
            >
              {loading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin px-2"
                />
              ) : null}
              ダウンロード
            </button>
          </div>
        </div>
      </div>
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
        <div className="shadow-xl p-5 flex flex-col border border-slate-300 rounded-xl lg:max-w-[60%] max-w-[90%] max-h-[70%]">
          {showItem}
        </div>
      </div>
      {user?.isAnonymous ? null : (
        <div className="container xl:max-w-5xl mx-auto relative top-[-10vh]">
          <h2 className="text-2xl text-center m-2">
            {user?.displayName}
            さんの他のファイル
          </h2>
          <InfiniteScroll
            loadMore={(page) => addRelations(page, user)} // 項目を読み込む際に処理するコールバック関数
            hasMore={hasMore} // 読み込みを行うかどうかの判定
            loader={
              <div className="text-2xl" key={0}>
                読み込み中...
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[90%] mx-auto">
              {fileList}
            </div>
          </InfiniteScroll>
        </div>
      )}
    </>
  );
};

export default download;
