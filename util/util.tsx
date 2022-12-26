import axios from "axios";
import Prism from "prismjs";
import { Dispatch, ReactElement, SetStateAction } from "react";
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

export interface GetUserProps {
  isDeletedUser: boolean;
  isAnonymous: boolean;
  iconURL?: string;
  displayName?: string;
  uid?: string;
  official?: boolean;
}

export const getStringBytes = (string: string): number =>
  encodeURIComponent(string).replace(/%../g, "x").length;

export const addRelations = (
  page: number,
  u: GetUserProps | null,
  setHasMore: Dispatch<SetStateAction<boolean>>,
  fileList: ReactElement[],
  setFileList: Dispatch<SetStateAction<ReactElement[]>>,
  id?: string,
  isuid?: boolean
) => {
  if (!u?.isAnonymous || !u?.isDeletedUser) {
    axios
      .get("/api/get", { params: { id, index: page * 3, isuid: !!isuid } })
      .then((r) => {
        if (r.data.length === 3) {
          setHasMore(true);
        } else if (r.data.length === 0) {
          setHasMore(false);
          return;
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
              if (
                output.innerHTML === "<div>null</div>" ||
                file.description === ""
              ) {
                output.innerHTML =
                  "<div class='italic'>このファイルに説明はありません。</div>";
              }

              return (
                <div
                  className="p-5 flex flex-col border border-slate-300 rounded-xl flex-grow"
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
                      className="btn btn-primary btn-block"
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
};
