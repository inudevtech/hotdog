import { faPaste, faFolder } from "@fortawesome/free-regular-svg-icons";
import { faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import { AccountContext, UploadFileContext } from "./_app";

const Upload = () => {
  const { uploadFile, setUploadFile } = useContext(UploadFileContext);
  const { AccountState } = useContext(AccountContext);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(true);
  const [excess, setExcess] = useState<boolean>(false);
  const [selectCheckbox, setSelectCheckbox] = useState<boolean[]>([]);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    if (uploadFile.length + files.length > 100) {
      setExcess(true);
    } else {
      setUploadFile([...uploadFile, ...files]);
    }
  };

  const fileSelected = (e: FormEvent<HTMLLabelElement>) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    addFiles(target.files!);
  };

  const onDrop = (files: File[]) => {
    addFiles(files);
  };

  useEffect(() => {
    setSelectCheckbox([
      ...selectCheckbox,
      ...Array(uploadFile.length - selectCheckbox.length).fill(false),
    ]);
  }, [uploadFile]);

  const startUpload = () => {};

  const toggleSumUpCheckboxState = () => {
    checkboxRef.current!.checked = !checkboxRef.current!.checked;
    checkboxRef.current!.indeterminate = false;
    setSelectCheckbox(selectCheckbox.fill(checkboxRef.current!.checked));
  };

  const toggleSelectCheckboxState = (index: number) => {
    const newSelectCheckbox = [...selectCheckbox];
    newSelectCheckbox[index] = !newSelectCheckbox[index];
    setSelectCheckbox(newSelectCheckbox);
    if (newSelectCheckbox.every((value) => value === true)) {
      checkboxRef.current!.checked = true;
      checkboxRef.current!.indeterminate = false;
    } else if (newSelectCheckbox.every((value) => value === false)) {
      checkboxRef.current!.checked = false;
      checkboxRef.current!.indeterminate = false;
    } else {
      checkboxRef.current!.checked = false;
      checkboxRef.current!.indeterminate = true;
    }
    console.log(newSelectCheckbox);
  };

  return (
    <Dropzone onDrop={onDrop} noClick>
      {({ getRootProps, isDragActive }) => (
        <div className="w-full min-h-screen" {...getRootProps()}>
          <div className="flex items-center flex-col pt-[120px] sm:pt-[100px] px-2 mb-[100px]">
            <div
              className={`flex flex-col rounded-lg w-full md:w-auto ${
                uploadFile.length === 0
                  ? " items-center justify-center"
                  : "shadow-lg border boreder-slate-300"
              }`}
            >
              {uploadFile.length !== 0 ? (
                <table className="table table-zebra w-full md:w-[760px]">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          className="checkbox"
                          ref={checkboxRef}
                          onChange={toggleSumUpCheckboxState}
                        />
                      </th>
                      <th>ファイル名</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadFile.map((file, i) => (
                      <tr key={i}>
                        <th>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectCheckbox[i]}
                            onChange={() => toggleSelectCheckboxState(i)}
                          />
                        </th>
                        <td>{file.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <FontAwesomeIcon
                  icon={faFolder}
                  className="h-1/2 w-1/2 md:h-1/2 md:w-1/2"
                  color="rgb(226 232 240)"
                />
              )}
            </div>
            <p className="text-lg text-red-500" hidden={!excess}>
              一度に送信できるファイルは10件までです！
            </p>
            {AccountState == null && isWarningOpen ? (
              <div className="md:relative bg-yellow-200/[.8] md:m-3 p-2 rounded border-2 border-yellow-300 lg:w-3/4 w-full xl:w-1/2 fixed bottom-0 left-0 z-10">
                <FontAwesomeIcon
                  icon={faXmark}
                  onClick={() => setIsWarningOpen(false)}
                  className="absolute top-0 right-0 p-2 cursor-pointer"
                  size="xl"
                />
                <p className="text-xl">
                  ログインせずにホットドッグを使用しています
                </p>
                <p className="text-red-500">
                  ログインしていない状態でアップロードされたファイルは7日後に自動的に削除されます！
                </p>
              </div>
            ) : null}

            <div className="fixed flex flex-col items-center justify-center gap-2 bottom-0 left-0 w-screen backdrop-blur-sm bg-white/30 p-5">
              <div className="flex flex-row items-center gap-2">
                <p className="hidden md:block">ファイルをドラッグ&ドロップ</p>
                <p className="text-center text-2xl hidden md:block">or</p>
                <label
                  htmlFor="upload"
                  className="btn btn-outline"
                  onChange={fileSelected}
                >
                  <FontAwesomeIcon icon={faUpload} className="pr-2" />
                  ファイルを選択
                  <input type="file" id="upload" className="hidden" multiple />
                </label>
              </div>
              {uploadFile.length === 1 ? (
                <button
                  className="btn btn-block btn-primary"
                  onClick={startUpload}
                  type="button"
                >
                  アップロードを開始
                </button>
              ) : null}
              {uploadFile.length > 1 ? (
                <button
                  className="btn btn-block btn-primary"
                  onClick={startUpload}
                  type="button"
                >
                  アップロードと圧縮を開始
                </button>
              ) : null}
            </div>

            <div
              className={`flex items-center justify-center flex-col gap-2 fixed bottom-0 top-0 left-0 w-screen shadow-lg backdrop-blur-sm z-20 ${
                isDragActive
                  ? "border-blue-600 bg-blue-100/20 border-4 border-dashed"
                  : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faPaste} size="4x" />
              <h1>ファイルを追加</h1>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

export default Upload;
