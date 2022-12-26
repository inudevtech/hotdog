import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Editor } from "@tinymce/tinymce-react";
import {
  Dispatch,
  FormEvent,
  useContext,
  useMemo,
  useRef,
  useState,
  SetStateAction,
  useEffect,
  ChangeEvent,
} from "react";
import axios, { AxiosError } from "axios";
// @ts-ignore
import DateTimePicker from "react-datetime-picker/dist/entry.nostyle";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import "react-datetime-picker/dist/DateTimePicker.css";
import Tippy from "@tippyjs/react";
import { getStringBytes } from "../util/util";
import { AccountContext } from "../pages/_app";
import Modal from "./Modal";
import "tippy.js/dist/tippy.css";

interface ModalProps {
  id: string;
  isElement?: boolean | null;
  showFlag?: boolean | null;
  setFlag?: Dispatch<SetStateAction<boolean>>;
  saveFlag?: boolean | null;
  setSaveFlag?: Dispatch<SetStateAction<boolean>> | null;
}

const Edit = (props: ModalProps) => {
  const { showFlag, setFlag, isElement, id, saveFlag, setSaveFlag } = props;
  const editorRef = useRef<Editor>(null);
  const [title, setTitle] = useState<string>("");
  const [tagText, setTagText] = useState<string>("");
  const { AccountState } = useContext(AccountContext);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | number>(false);
  const [defaultContent, setDefaultContent] = useState<string | null>(null);
  const [privateFile, setPrivateFile] = useState<boolean>(false);
  const [password, setPassword] = useState<string | null>("");
  const [uploadDate, setUploadDate] = useState<Date | string>(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string>("");

  const save = async () => {
    if (editorRef.current) {
      const content = editorRef.current.editor?.getContent();

      if (getStringBytes(content!) > 65535) {
        setError(0);
      } else if (getStringBytes(title) > 256) {
        setError(1);
      } else {
        setLoading(true);
        setDirty(false);
        editorRef.current.editor?.setDirty(false);

        let accessToken;
        if (AccountState == null) {
          accessToken = null;
        } else {
          accessToken = await AccountState?.getIdToken();
        }

        const params = {
          token: accessToken,
          id,
        };
        axios
          .post(
            "/api/description",
            {
              description: content,
              title,
              privateFile,
              password,
              uploadDate,
              tags,
            },
            { params }
          )
          .then(() => {
            setLoading(false);
            setError(false);
          })
          .catch((e: AxiosError) => {
            setLoading(false);
            setError(e.response?.status!);
            setDirty(true);
          });
      }
    }
  };

  useEffect(() => {
    if (saveFlag) {
      save();
      setSaveFlag!(false);
    }
  }, [saveFlag]);

  useMemo(() => {
    if (showFlag && AccountState) {
      axios
        .get("/api/description", { params: { id } })
        .then((res) => {
          let { description } = res.data;
          if (description === null) {
            description = "";
          }
          setDefaultContent(description);
          setPrivateFile(res.data.private);
          setPassword(res.data.password === 1 ? null : "");
          setUploadDate(res.data.uploadDate);
          editorRef.current?.editor?.setContent(description);
          setTitle(res.data.displayName);
        })
        .catch((e: AxiosError) => {
          setError(e.response?.status!);
        });
    }
  }, [showFlag]);

  let errorMsg: string = "";
  if (error === 0) errorMsg = "説明文が長すぎます。説明文を短くしてください。";
  else if (error === 1)
    errorMsg = "タイトルが長すぎます。タイトルを短くしてください。";
  else if (typeof error === "number") {
    errorMsg =
      "何らかの原因により保存できませんでした。少し経ってからもう一度保存してください。";
  }

  const togglePrivate = () => {
    setPrivateFile(!privateFile);
    setDirty(true);
  };

  const inputPassword = (e: FormEvent<HTMLInputElement>) => {
    setDirty(true);
    setPassword(e.currentTarget.value);
  };

  const onChangeTagValue = (e: ChangeEvent<HTMLInputElement>) => {
    setDirty(true);
    setError(false);
    setTagError("");
    const { value } = e.target;
    if (value.indexOf(" ") === -1) {
      setTagText(value);
    } else if (
      tags.indexOf(value.replace(" ", "")) === -1 &&
      value.length > 1 &&
      tags.length < 5
    ) {
      setTags([...tags, value.replace(" ", "")]);
      setTagText("");
    } else {
      setTagText(value.replace(" ", ""));
      if (tags.length >= 5) {
        setTagError("タグは5つまでです。");
      } else if (tags.indexOf(value.replace(" ", "")) !== -1) {
        setTagError("同じタグは登録できません。");
      }
    }
  };

  const content = (
    <div className="flex gap-2 flex-col">
      <div
        className={`flex gap-2 flex-col ${
          AccountState == null ? "" : "md:flex-row"
        }`}
      >
        <div className="grow">
          {AccountState == null ? (
            <p>タイトルや説明など、詳細設定はログインすると記入できます。</p>
          ) : (
            <div className="flex gap-2 flex-col">
              <p className="text-2xl">タイトル</p>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setDirty(true);
                  setError(false);
                  setTitle(e.target.value);
                }}
                className="input input-bordered w-full"
              />
              <div>
                <p className="text-xl">タグ</p>
                <p className="text-sm">最大５個まで</p>
                <div className="flex gap-2 items-center flex-wrap	">
                  {tags.map((tag) => (
                    <div
                      className="badge badge-outline flex items-center gap-1"
                      key={tag}
                    >
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="cursor-pointer"
                        onClick={() => {
                          setDirty(true);
                          setError(false);
                          setTags(tags.filter((t) => t !== tag));
                        }}
                      />
                      {tag}
                    </div>
                  ))}
                  <Tippy
                    content={tagError}
                    visible={!!tagError}
                    onClickOutside={() => setTagError("")}
                    placement="top-start"
                  >
                    <input
                      type="text"
                      id="tag"
                      onChange={onChangeTagValue}
                      value={tagText}
                      className="input input-bordered grow input-sm"
                    />
                  </Tippy>
                </div>
              </div>
              <p className="text-2xl">ファイルの説明</p>
              {defaultContent !== null && (
                <Editor
                  ref={editorRef}
                  apiKey={process.env.NEXT_PUBLIC_TINY_APIKEY}
                  initialValue={defaultContent}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "codesample",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "help",
                    ],
                    toolbar:
                      "undo redo | blocks | " +
                      "bold italic forecolor backcolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "codesample removeformat | help",
                    language: "ja",
                    language_url: "/ja.js",
                  }}
                  onDirty={() => {
                    setDirty(true);
                    setError(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div className="border-r border-t border-slate-200 border-2" />
        <div
          className={`flex flex-col gap-2 ${
            AccountState ? "md:max-w-[250px]" : ""
          }`}
        >
          <div hidden={!AccountState}>
            <label
              htmlFor="privateSwitch"
              className="flex relative cursor-pointer gap-3"
            >
              <input
                type="checkbox"
                id="privateSwitch"
                className="checkbox"
                onChange={togglePrivate}
                checked={privateFile}
              />
              <span>非公開ファイル</span>
            </label>
            <p className="text-sm">
              非公開にすると関連欄にファイルが表示されなくなります
            </p>
          </div>
          <div hidden={!AccountState}>
            <span>ダウンロードパスワード</span>
            <p className="text-sm">
              パスワードを設定するとダウンロード時にパスワードを求められます。
            </p>
            <input
              type="password"
              placeholder="パスワード"
              className="input input-bordered w-full"
              onChange={inputPassword}
              maxLength={72}
              value={password === null ? "passwordpassword" : password}
            />
            <p className="text-sm">
              保存したパスワードは16桁のパスワードとして表示されます
            </p>
          </div>
          <div hidden={!AccountState}>
            <span>予約投稿</span>
            <p className="text-sm">
              設定した時間にファイルが公開されます。設定しない場合は即時公開されます。
            </p>
            <DateTimePicker
              onChange={(value: string) => {
                setUploadDate(value);
                setDirty(true);
              }}
              value={
                typeof uploadDate === "string"
                  ? new Date(uploadDate)
                  : uploadDate
              }
              required
              minDate={new Date()}
            />
          </div>
        </div>
      </div>
      {!isElement && (
        <button
          type="button"
          onClick={save}
          className="btn btn-primary btn-block"
          disabled={!dirty}
        >
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin px-2" />
          ) : null}
          {dirty ? "保存" : "保存済み"}
        </button>
      )}
      <p className="text-red-500">{errorMsg}</p>
    </div>
  );

  return isElement ? (
    content
  ) : (
    <Modal
      className={`w-full p-5 ${
        AccountState == null
          ? "md:w-1/3 sm:w-1/2"
          : "xl:w-2/3 xl:max-w-[1024px] lg:w-3/4"
      }`}
      isOpen={showFlag!}
      setOpen={setFlag!}
    >
      {content}
    </Modal>
  );
};

Edit.defaultProps = {
  isElement: false,
  showFlag: true,
  setFlag: null,
  saveFlag: null,
  setSaveFlag: null,
};

export default Edit;
