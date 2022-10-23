import { useRouter } from "next/router";
import {
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  faCheckCircle,
  faCircleInfo,
  faDownload,
  faExclamationCircle,
  faFontAwesome,
  faHeart,
  faPen,
  faSpinner,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Prism from "prismjs";
import InfiniteScroll from "react-infinite-scroller";
import { parseCookies, setCookie } from "nookies";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { addRelations, GetUserProps } from "../../util/util";
import RemoveModal from "../../components/RemoveModal";
import { AccountContext } from "../_app";
import EditModal from "../../components/EditModal";
import Modal from "../../components/Modal";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-php";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-cpp";
import "prismjs/themes/prism-tomorrow.css";

const download = () => {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [title, setTitle] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExists, setIsExists] = useState<boolean | null | undefined>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [user, setUser] = useState<GetUserProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isIcon, setIsIcon] = useState<boolean>(false);
  const [fileList, setFileList] = useState<ReactElement[]>([]);
  const [like, setLike] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [downloadCount, setDownloadCount] = useState<number>(0);
  const flag = useState<boolean>(false);
  const { AccountState } = useContext(AccountContext);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [passwordOpen, setPasswordOpen] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { id } = router.query;
      setLike(parseCookies().like === "1");

      let accessToken;
      if (AccountState == null) {
        accessToken = undefined;
      } else {
        accessToken = await AccountState?.getIdToken();
      }

      if (id) {
        axios
          .get("/api/get", { params: { id, token: accessToken } })
          .then((res) => {
            setIsExists(res.data.exists);
            if (res.data.exists) {
              setTitle(
                res.data.displayName === "" ? null : res.data.displayName
              );
              setDescription(
                res.data.description === "" ? null : res.data.description
              );
              setFileName(res.data.fileName);
              setIsIcon(res.data.icon);
              setLikeCount(res.data.favorite);
              setDownloadCount(res.data.download);
              setIsProtected(res.data.isProtected);
              let u: GetUserProps | null;
              if (res.data.user.isDeletedUser) {
                u = {
                  isAnonymous: false,
                  isDeletedUser: true,
                  iconURL: undefined,
                  displayName: "削除済みユーザー",
                };
              } else {
                u = res.data.user;
              }

              setUser(u);
              addRelations(
                0,
                u,
                router.query.id as string,
                setHasMore,
                fileList,
                setFileList
              );
            }
          })
          .catch(() => {
            setIsExists(undefined);
          });
      } else {
        setIsExists(false);
      }
    })();
  }, [router]);

  let showItem;

  const getDownloadLink = (password?: string) => {
    setLoading(true);
    // Recaptcha認証を行う
    if (executeRecaptcha) {
      executeRecaptcha!("download").then((token) => {
        const { id } = router.query;
        axios
          .get("/api/download", {
            params: { id, recaptcha: token, pass: password },
          })
          .then((res) => {
            const link = document.createElement("a");
            link.download = fileName!;
            link.href = res.data.url;
            link.click();
            link.remove();
            setLoading(false);
            setErrMsg("");
          })
          .catch((res) => {
            if (res.response.status === 403) {
              setLoading(false);
              setErrMsg("パスワードが違います");
            }
          });
      });
    }
  };

  const downloadFile = () => {
    if (isProtected) {
      setPasswordOpen(true);
      return;
    }

    getDownloadLink();
  };

  const passwordDownload = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    getDownloadLink(elements[0].value);
  };

  const toggleLike = () => {
    executeRecaptcha!("favorite").then(async (token) => {
      const { id } = router.query;
      const type = parseCookies().like === "1" ? "0" : "1";
      await axios.post("/api/favorite", null, {
        params: { id, type, recaptcha: token },
      });
      setCookie(null, "like", type, {
        maxAge: 60 * 60 * 24 * 365 * 100,
        path: `/d/${id}`,
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
        {user?.official && (
          <Tippy content="運営または認証済みのユーザー">
            <FontAwesomeIcon icon={faCheckCircle} className="text-sky-500" />
          </Tippy>
        )}
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
          {isProtected ? (
            <p className="bg-yellow-300/[.6] rounded border border-yellow-400 p-2 my-2">
              <FontAwesomeIcon icon={faExclamationCircle} className="px-2" />
              パスワード保護されたファイルです。
            </p>
          ) : null}
          {output.innerHTML === "<div>null</div>" ? null : (
            // eslint-disable-next-line react/no-danger
            <div
              dangerouslySetInnerHTML={{ __html: output.innerHTML }}
              className="border-t-2 mt-2 p-1 max-h-[50vh] overflow-auto break-words"
            />
          )}
        </div>
        <div className="justify-between flex flex-col min-w-[250px] flex-grow">
          <div className="hidden lg:block">{userElement}</div>
          <div className="flex gap-2 flex-col">
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
                        ? " text-red-500 hover:text-red-400 bg-red-100"
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
                    className="text-slate-400 hover:text-green-500 transition"
                  />
                  {downloadCount}
                </div>
              </Tippy>
              <Tippy content="このファイルを報告">
                <FontAwesomeIcon
                  icon={faFontAwesome}
                  onClick={report}
                  className="text-slate-300 cursor-pointer hover:text-red-500 transition"
                />
              </Tippy>
            </div>
            {user?.uid === AccountState?.uid && AccountState !== null && (
              <>
                <span className="border-b-2" />
                <div className="flex flex-row justify-around items-center">
                  <Tippy content="ファイルを削除">
                    <FontAwesomeIcon
                      icon={faXmark}
                      onClick={() => flag[1](true)}
                      fixedWidth
                      className="border hover:shadow-lg cursor-pointer px-[8px] py-[10px] rounded-full transition text-slate-400 hover:text-red-500"
                    />
                  </Tippy>
                  <Tippy content="ファイル情報を編集する">
                    <FontAwesomeIcon
                      icon={faPen}
                      onClick={() => setEditOpen(true)}
                      fixedWidth
                      className="border hover:shadow-lg cursor-pointer px-[8px] py-[10px] rounded-full transition text-slate-400 hover:text-slate-500"
                    />
                  </Tippy>
                </div>
              </>
            )}
            <button
              type="button"
              className="transition p-1 my-2 md:min-w-[300px] w-full lg:min-w-0 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
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
      <RemoveModal id={router.query.id as string} flag={flag} />
      <EditModal
        showFlag={editOpen}
        setFlag={setEditOpen}
        id={router.query.id as string}
      />
      <Modal isOpen={passwordOpen} setOpen={setPasswordOpen} className="p-5">
        <form className="flex flex-col gap-2" onSubmit={passwordDownload}>
          <h2>ダウンロードパスワードの入力</h2>
          <p>
            このファイルはパスワード保護されています。ダウンロードにはパスワードが必要です。
          </p>
          <input
            type="password"
            placeholder="パスワード"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
          />
          <button
            type="submit"
            className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin px-2" />
            ) : null}
            ダウンロード
          </button>
        </form>
        <p className="text-red-500 whitespace-pre-wrap">{errMsg}</p>
      </Modal>
      <div className="flex lg:justify-center pt-[120px] lg:pt-0 items-center lg:h-screen flex-col">
        <div className="shadow-xl p-5 flex flex-col border border-slate-300 rounded-xl lg:max-w-[60%] max-w-[90%] lg:max-h-[70%] overflow-auto">
          {showItem}
        </div>
      </div>
      {user?.isAnonymous || !isExists ? null : (
        <div className="container xl:max-w-5xl mx-auto lg:relative lg:top-[-10vh] mt-3 lg:mt-0">
          <h2 className="text-2xl text-center m-2">
            {user?.displayName}
            さんの他のファイル
          </h2>
          <InfiniteScroll
            loadMore={(page) =>
              addRelations(
                page,
                user,
                router.query.id as string,
                setHasMore,
                fileList,
                setFileList
              )
            } // 項目を読み込む際に処理するコールバック関数
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
