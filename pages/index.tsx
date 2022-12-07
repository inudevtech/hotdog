import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useState } from "react";
import Dropzone from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/router";
import { UploadFileContext } from "./_app";

const index = () => {
  const { uploadFile, setUploadFile } = useContext(UploadFileContext);
  const [excess, setExcess] = useState<boolean>(false);
  const router = useRouter();

  const addFiles = (files: FileList | File[]) => {
    if (uploadFile.length + files.length > 10) {
      setExcess(true);
    } else {
      setUploadFile([...uploadFile, ...files]);
    }

    router.push("/upload");
  };

  const onDrop = (files: File[]) => {
    addFiles(files);
  };

  const fileSelected = (e: FormEvent<HTMLLabelElement>) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    addFiles(target.files!);
  };

  return (
    <Dropzone onDrop={onDrop}>
      {({ getRootProps, isDragActive }) => (
        <>
          <div className="w-full pt-[60px] relative" {...getRootProps()}>
            <div
              className={`w-full p-5 flex lg:min-h-[400px] max-h-[80vh] overflow-y-auto justify-center transition-all ${
                isDragActive
                  ? "bg-blue-100 border-2 border-t-0 border-blue-600 border-dashed"
                  : ""
              }`}
            >
              <div className="md:basis-1/2 flex flex-col gap-2">
                <p className="text-center text-4xl">
                  ファイルをドラッグ&ドロップ
                </p>
                <p className="text-center text-2xl hidden md:block">or</p>
                <label
                  htmlFor="upload"
                  className="transition p-2 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block w-full text-center"
                  onChange={fileSelected}
                >
                  <FontAwesomeIcon icon={faUpload} className="pr-2" />
                  ファイルをアップロード
                  <input type="file" id="upload" className="hidden" multiple />
                </label>
                <p className="text-lg text-red-500" hidden={!excess}>
                  一度に送信できるファイルは10件までです！
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:absolute smh:static md:top-[90vh] flex justify-center">
            <div className="transition ease-out duration-300 transform hover:scale-125 overflow-x-hidden flex items-center">
              <a
                className="text-2xl md:text-4xl logo-text flex gap-1 items-center justify-center m-2 about-link transition flex-wrap"
                href="https://www.inu-dev.tech/hotdog"
              >
                <Image
                  src="/hotdog-emoji.svg"
                  width="40"
                  height="40"
                  alt="Hotdog Emoji"
                />
                <span className="item transition-all">ホットドッグ</span>
                <span>とは？</span>
              </a>
              <p className="w-[100px] h-[15px] border-b border-r transform skew-x-[45deg] mr-2 border-slate-900" />
            </div>
          </div>
        </>
      )}
    </Dropzone>
  );
};

export default index;
