import axios, { AxiosRequestConfig } from "axios";
import { ReactElement, useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faLink,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import EditModal from "./EditModal";
import { AccountContext } from "../pages/_app";

const ShowFile = (props: { file: File }) => {
  const [progress, setProgress] = useState<number>(0);
  const [id, setId] = useState<string>("");
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const { file } = props;
  const { AccountState } = useContext(AccountContext);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [showItem, setShowItem] = useState<ReactElement | null>(null);

  useEffect(() => {
    (async () => {
      if (file.size > 1000 * 1000 * 1000 * 5) {
        setProgress(-2);
      } else {
        let accessToken;
        if (AccountState == null) {
          accessToken = null;
        } else {
          accessToken = await AccountState?.getIdToken();
        }

        const token = await executeRecaptcha!("upload");

        const params = {
          filename: file.name,
          token: accessToken,
          recaptcha: token,
          contentLength: file.size,
        };

        axios
          .post("/api/upload", null, { params })
          .then((res) => {
            const config: AxiosRequestConfig = {
              onUploadProgress: (progressEvent) => {
                setProgress(
                  (progressEvent.loaded * 100) / progressEvent.total!
                );
              },
              headers: {
                "Content-Type": "application/octet-stream",
                "x-goog-acl": "private",
                "x-goog-content-length-range": `${file.size},${file.size}`,
              },
            };
            if (res.data.customTime) {
              config.headers!["x-goog-custom-time"] = res.data.customTime;
            }

            axios
              .put(res.data.url, file, config)
              .then(() => {
                setId(res.data.id);
              })
              .catch(() => {
                setProgress(-1);
              });
          })
          .catch(() => {
            setProgress(-1);
          });
      }
    })();
  }, []);

  const setShowFlag = (flag: boolean) => {
    setEditOpen(flag);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://hotdog.inu-dev.tech/d/${id}`);
  };

  useEffect(() => {
    if (progress === -2) {
      setShowItem(
        <Tippy content="ファイルが大きすぎます！">
          <div className="w-full p-[2px] border border-red-300 rounded overflow-hidden whitespace-nowrap bg-red-200">
            <FontAwesomeIcon icon={faCircleExclamation} className="mx-2" />
            ファイルが大きすぎます：
            {file.name}
          </div>
        </Tippy>
      );
    } else if (progress === -1) {
      setShowItem(
        <Tippy content="何らかのエラーが発生しました">
          <div className="w-full p-[2px] border border-red-300 rounded overflow-hidden whitespace-nowrap bg-red-200">
            <FontAwesomeIcon icon={faCircleExclamation} className="mx-2" />
            {file.name}
          </div>
        </Tippy>
      );
    } else if (progress !== 100) {
      setShowItem(
        <>
          <div
            className="w-full p-[2px] border border-slate-300 rounded overflow-hidden whitespace-nowrap"
            style={{
              background: `linear-gradient(to right, rgb(129 140 248) ${progress}%, #fff 0`,
            }}
          >
            {file.name}
          </div>
          <span>{Math.round(progress)}%</span>
        </>
      );
    } else {
      setShowItem(
        <>
          <span className="overflow-hidden whitespace-nowrap w-full">
            {file.name}
          </span>
          <div className="flex gap-1">
            <Tippy
              content="リンクをクリップボードにコピーしました!"
              trigger="click"
            >
              <Tippy content="リンクをコピーする">
                <button
                  type="button"
                  className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-green-500"
                  id="url-button"
                  onClick={copyLink}
                >
                  <FontAwesomeIcon icon={faLink} />
                </button>
              </Tippy>
            </Tippy>
            <Tippy content="ファイル情報を編集する">
              <button
                type="button"
                className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-green-500"
                id="url-button"
                onClick={() => setShowFlag(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
            </Tippy>
          </div>
        </>
      );
    }
  }, [progress]);

  return (
    <>
      <div className="flex items-center justify-between gap-2">{showItem}</div>
      <EditModal showFlag={editOpen} setFlag={setShowFlag} id={id} />
    </>
  );
};

export default ShowFile;
