import { faPaste, faFolder } from "@fortawesome/free-regular-svg-icons";
import { faTrash, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import {
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Dropzone from "react-dropzone";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Modal from "../../components/Modal";
import SimpleTransition from "../../components/transitions/simple";
import { AccountContext, UploadFileContext } from "../_app";

const Upload = () => {
  const { uploadFile, setUploadFile } = useContext(UploadFileContext);
  const { AccountState } = useContext(AccountContext);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(true);
  const [selectCheckbox, setSelectCheckbox] = useState<boolean[]>([]);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | number[]>(-2);
  const [errorText, setErrorText] = useState<string>("");
  const [isOpenErrDialog, setIsOpenErrDialog] = useState<boolean>(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const router = useRouter();

  const addFiles = (files: FileList | File[]) => {
    if (uploadFile.length + files.length > 10) {
      setErrorText("アップロードできるファイルは最大で10個までです。");
      setIsOpenErrDialog(true);
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
    if (uploadFile.length > selectCheckbox.length) {
      setSelectCheckbox([
        ...selectCheckbox,
        ...Array(uploadFile.length - selectCheckbox.length).fill(false),
      ]);
    } else {
      setSelectCheckbox(Array(uploadFile.length).fill(false));
    }
  }, [uploadFile]);

  useEffect(() => {
    if (!checkboxRef.current) return;
    if (selectCheckbox.every((value) => value === true)) {
      checkboxRef.current!.checked = true;
      checkboxRef.current!.indeterminate = false;
    } else if (selectCheckbox.every((value) => value === false)) {
      checkboxRef.current!.checked = false;
      checkboxRef.current!.indeterminate = false;
    } else {
      checkboxRef.current!.checked = false;
      checkboxRef.current!.indeterminate = true;
    }
  }, [selectCheckbox]);

  const showErrorDialog = () => {
    setErrorText(
      "アップロードに失敗しました。\n何回も繰り返される場合は、お問い合わせよりご連絡ください。"
    );
    setIsOpenErrDialog(true);
    setIsTransitioning(true);
    setUploadProgress(-2);
  };

  const actionWhenSuccess = (id: string) => {
    setIsTransitioning(true);
    setUploadProgress(-3);
    setUploadFile([]);
    router.push(
      { pathname: "/upload/description", query: { id } },
      "/upload/description"
    );
  };

  const startUpload = async () => {
    const duplicateUploadFiles = uploadFile
      .map((file) => file.name)
      .filter((file, i, arr) => !(arr.indexOf(file) === i));
    if (duplicateUploadFiles.length !== 0) {
      setErrorText(
        `同じファイル名が複数存在します。\n${duplicateUploadFiles.join("\n")}`
      );
      setIsOpenErrDialog(true);
      return;
    }
    setIsTransitioning(true);
    setUploadProgress(-1);

    let accessToken;
    if (AccountState == null) {
      accessToken = null;
    } else {
      accessToken = await AccountState?.getIdToken();
    }

    const token = await executeRecaptcha!("upload");

    const params = {
      token: accessToken,
      recaptcha: token,
    };

    const res = await axios
      .post(
        "/api/upload",
        {
          filenames: uploadFile.map((file) => file.name),
          contentLengths: uploadFile.map((file) => file.size),
        },
        { params }
      )
      .catch(() => {
        setErrorText(
          "アップロードに失敗しました。\n何回も繰り返される場合は、お問い合わせよりご連絡ください。"
        );
        setIsOpenErrDialog(true);
        setUploadProgress(-2);
      });

    Promise.all(
      res!.data.map((data: any, index: number) => {
        const file = uploadFile[index];

        const config: AxiosRequestConfig = {
          onUploadProgress: (progressEvent) => {
            if (!(uploadProgress instanceof Array)) {
              const newUploadProgress = Array(uploadFile.length).fill(0);
              newUploadProgress[index] =
                (progressEvent.loaded * 100) / progressEvent.total!;
              setUploadProgress(newUploadProgress);
            } else {
              const newUploadProgress = [
                ...(uploadProgress as unknown as number[]),
              ];
              newUploadProgress[index] =
                (progressEvent.loaded * 100) / progressEvent.total!;
              setUploadProgress(newUploadProgress);
            }
          },
          headers: {
            "Content-Type": "application/octet-stream",
            "x-goog-acl": "private",
            "x-goog-content-length-range": `${file.size},${file.size}`,
          },
        };
        if (data.customTime) {
          config.headers!["x-goog-custom-time"] = data.customTime;
        }
        return axios.put(data.url, file, config);
      })
    )
      .then(() => {
        if (uploadFile.length > 1) {
          setUploadProgress(-1);
          axios
            .post("/api/compress", null, {
              params: { id: res!.data[0].id },
            })
            .then(() => {
              actionWhenSuccess(res!.data[0].id);
            })
            .catch(() => {
              showErrorDialog();
            });
        } else {
          actionWhenSuccess(res!.data[0].id);
        }
      })
      .catch(() => {
        showErrorDialog();
      });
  };

  const toggleSumUpCheckboxState = () => {
    checkboxRef.current!.checked = checkboxRef.current!.checked;
    checkboxRef.current!.indeterminate = false;
    setSelectCheckbox([...selectCheckbox].fill(checkboxRef.current!.checked));
  };

  const toggleSelectCheckboxState = (index: number) => {
    const newSelectCheckbox = [...selectCheckbox];
    newSelectCheckbox[index] = !newSelectCheckbox[index];
    setSelectCheckbox(newSelectCheckbox);
  };

  let buttonBelow: ReactElement;
  if (selectCheckbox.includes(true)) {
    buttonBelow = (
      <button
        className="btn btn-error btn-block"
        onClick={() => {
          setUploadFile(uploadFile.filter((_, i) => !selectCheckbox[i]));
        }}
        type="button"
      >
        <FontAwesomeIcon icon={faTrash} />
        キューから削除
      </button>
    );
  } else if (uploadFile.length === 1) {
    buttonBelow = (
      <button
        className="btn btn-block btn-primary"
        onClick={startUpload}
        type="button"
      >
        アップロードを開始
      </button>
    );
  } else if (uploadFile.length > 1) {
    buttonBelow = (
      <button
        className="btn btn-block btn-primary"
        onClick={startUpload}
        type="button"
      >
        アップロードと圧縮を開始
      </button>
    );
  }

  return (
    <Dropzone onDrop={onDrop} noClick>
      {({ getRootProps, isDragActive }) => (
        <>
          <div className="w-full min-h-screen" {...getRootProps()}>
            <div className="flex items-center flex-col pt-[120px] sm:pt-[100px] px-2 pb-[180px]">
              <div
                className={`flex flex-col rounded-lg w-full md:w-auto ${
                  uploadFile.length === 0
                    ? " items-center justify-center"
                    : "shadow-lg border boreder-slate-300"
                }`}
              >
                {uploadFile.length !== 0 ? (
                  <table className="table table-zebra">
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
                        // eslint-disable-next-line react/no-array-index-key
                        <tr key={i}>
                          <th>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectCheckbox[i]}
                              onChange={() => toggleSelectCheckboxState(i)}
                            />
                          </th>
                          <td className="max-w-[calc(100vw_-_80px)] md:max-w-[680px] md:w-[680px] truncate">
                            {file.name}
                          </td>
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

              <div className="fixed items-center flex flex-col gap-2 bottom-0 left-0 w-screen backdrop-blur-sm bg-white/30 p-5 z-20">
                {selectCheckbox.includes(true) ? (
                  <span>
                    {selectCheckbox.filter((value) => value === true).length}
                    ファイル選択中
                  </span>
                ) : (
                  <span>
                    {selectCheckbox.length}
                    ファイルキューにあります
                  </span>
                )}
                <div className="flex flex-row items-center justify-center gap-2 w-full">
                  <p className="hidden md:block">ファイルをドラッグ&ドロップ</p>
                  <p className="text-center text-2xl hidden md:block">or</p>
                  <label
                    htmlFor="upload"
                    className="btn btn-outline w-full md:w-auto"
                    onChange={fileSelected}
                  >
                    <FontAwesomeIcon icon={faUpload} className="pr-2" />
                    ファイルを選択
                    <input
                      type="file"
                      id="upload"
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
                {buttonBelow}
              </div>

              <div
                className={`flex items-center justify-center flex-col gap-2 fixed bottom-0 top-0 left-0 w-screen shadow-lg backdrop-blur-sm z-30 ${
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
          <Modal isOpen={isOpenErrDialog} setOpen={setIsOpenErrDialog}>
            <p className="p-5 whitespace-pre-wrap">{errorText}</p>
          </Modal>
          <div
            className="fixed bottom-0 left-0 top-0 right-0 backdrop-blur-md bg-white/10 p-5 z-20"
            hidden={uploadProgress === -2}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              {uploadProgress === -1 || uploadProgress === -3 ? (
                <>
                  <h1>処理中</h1>
                  <progress className="progress w-56" />
                </>
              ) : (
                <>
                  <h1>アップロード中</h1>
                  <span>
                    {uploadProgress instanceof Array
                      ? Math.floor(
                          uploadProgress.reduce((acc, cur) => acc + cur) /
                            uploadProgress.length
                        )
                      : Math.floor(uploadProgress)}
                    %
                  </span>
                  <progress
                    className="progress w-56"
                    value={
                      uploadProgress instanceof Array
                        ? Math.floor(
                            uploadProgress.reduce((acc, cur) => acc + cur) /
                              uploadProgress.length
                          )
                        : Math.floor(uploadProgress)
                    }
                    max="100"
                  />
                </>
              )}
            </div>
          </div>
          <SimpleTransition
            isTransitioning={isTransitioning}
            setIsTransitioning={setIsTransitioning}
          />
        </>
      )}
    </Dropzone>
  );
};

export default Upload;
