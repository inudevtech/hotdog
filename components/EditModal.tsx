import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Editor } from "@tinymce/tinymce-react";
import { useContext, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { getStringBytes } from "../util/util";
import { AccountContext } from "../pages/_app";

interface ModalProps {
  showFlag: boolean;
  setFlag: any;
  id: string;
}

const Modal = (props: ModalProps) => {
  const { showFlag, setFlag, id } = props;
  const editorRef = useRef<Editor>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const { AccountState } = useContext(AccountContext);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | number>(false);

  const save = async () => {
    if (editorRef.current && titleRef.current) {
      const content = editorRef.current.editor?.getContent();
      const title = titleRef.current.value;

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
          .post("/api/description", { description: content, title }, { params })
          .then(() => {
            setLoading(false);
          })
          .catch((e: AxiosError) => {
            setLoading(false);
            setError(e.response?.status!);
            setDirty(true);
          });
      }
    }
  };

  let errorMsg: string = "";
  if (error === 0) errorMsg = "説明文が長すぎます。説明文を短くしてください。";
  else if (error === 1)
    errorMsg = "タイトルが長すぎます。タイトルを短くしてください。";
  else if (typeof error === "number") {
    errorMsg =
      "何らかの原因により保存できませんでした。少し経ってからもう一度保存してください。";
  }

  return showFlag ? (
    <div className="fixed top-0 left-0 w-full h-full bg-stone-500/50 flex items-center justify-center z-20">
      <div
        className={`bg-white rounded-xl w-full max-h-screen overflow-auto ${
          AccountState == null ? "md:w-1/3 sm:w-1/2" : "lg:w-5/6"
        }`}
      >
        <FontAwesomeIcon
          icon={faXmark}
          onClick={() => setFlag()}
          className="block mr-0 ml-auto p-1 cursor-pointer"
        />
        <div
          className={`m-2 mt-0 flex gap-2 flex-col-reverse ${
            AccountState == null ? "" : "md:flex-row"
          }`}
        >
          <div className="grow">
            {AccountState == null ? (
              <p>タイトルと説明はログインすると記入できます。</p>
            ) : (
              <>
                <p className="m-2 text-xl">タイトル</p>
                <input
                  type="text"
                  className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2 w-full"
                  ref={titleRef}
                  onChange={() => {
                    setDirty(true);
                    setError(false);
                  }}
                />
                <p className="m-2 text-xl">ファイルの説明</p>
                <Editor
                  ref={editorRef}
                  apiKey={process.env.NEXT_PUBLIC_TINY_APIKEY}
                  initialValue=""
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
                    language_url: "./ja.js",
                  }}
                  onDirty={() => {
                    setDirty(true);
                    setError(false);
                  }}
                />
                <button
                  type="button"
                  onClick={save}
                  className="transition p-2 m-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400 disabled:bg-slate-400 disabled:border-slate-500 disabled:text-slate-600"
                  disabled={!dirty}
                >
                  {loading ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin px-2"
                    />
                  ) : null}
                  {dirty ? "保存" : "保存済み"}
                </button>
                <p className="text-red-500">{errorMsg}</p>
              </>
            )}
          </div>
          <div className="border-r border-t border-slate-200 border-2" />
          <div>
            <p>共有URL</p>
            <p className="border rounded border-slate-500 select-all p-1 max-w-[250px] overflow-hidden whitespace-nowrap">{`https://hotdog.inu-dev.tech/${id}`}</p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
};

export default Modal;
