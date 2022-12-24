import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useContext, useState } from "react";
import Dropzone from "react-dropzone";
import { useRouter } from "next/router";
import { UploadFileContext } from "./_app";
import Hotdog from "../public/hotdog.svg";

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

    router.push("/upload/");
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
    <Dropzone onDrop={onDrop} noClick>
      {({ getRootProps }) => (
        <div
          className="w-full pt-[60px] relative min-h-screen flex flex-col gap-5"
          {...getRootProps()}
        >
          <div className="pt-[100px] sm:pt-[50px] container mx-auto py-3 flex flex-col gap-2">
            <p className="text-center text-4xl hidden md:block font-bold">
              ファイルをドラッグ&ドロップ
            </p>
            <p className="text-center text-2xl hidden md:block">or</p>
            <label
              htmlFor="upload"
              className="btn btn-block btn-primary"
              onChange={fileSelected}
            >
              <FontAwesomeIcon icon={faUpload} className="pr-2" />
              ファイルをアップロード
              <input type="file" id="upload" className="hidden" multiple />
            </label>
            <p className="text-lg text-red-500" hidden={!excess}>
              一度に送信できるファイルは10件までです！
            </p>

            <div className="border-b-2 border-black relative mt-[30px]">
              <div className="border-2 border-black absolute top-[-25px] left-[calc(50%_-_25px)] w-[50px] h-[50px] rounded-full bg-white">
                <Hotdog />
              </div>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

export default index;
