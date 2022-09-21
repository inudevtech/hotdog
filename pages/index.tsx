import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FormEvent, Component, ReactElement } from "react";
import { faFolder } from "@fortawesome/free-regular-svg-icons";
import {
  IWithGoogleReCaptchaProps,
  withGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import Dropzone from "react-dropzone";
import Image from "next/image";
import ShowFile from "../components/ShowFile";
import { AccountContext } from "./_app";

interface indexProps {
  file: ReactElement[];
  isWarningOpen: boolean;
  excess: boolean;
}

class index extends Component<{}, indexProps> {
  // eslint-disable-next-line no-unused-vars
  private readonly onDrop: (files: any) => void;

  constructor(props: {} | Readonly<{}>) {
    super(props);

    this.onDrop = (files: File[]) => {
      this.addFiles(files);
    };
    this.state = {
      file: [],
      isWarningOpen: true,
      excess: false,
    };
  }

  addFiles(files: FileList | File[]) {
    const { file } = this.state;
    const { executeRecaptcha } = (
      this.props as unknown as IWithGoogleReCaptchaProps
    ).googleReCaptchaProps;

    // Recaptcha認証を行う
    if (executeRecaptcha) {
      for (let i = 0; i < files.length!; i += 1) {
        if (file.length + i >= 10) {
          this.setState({ excess: true });
          break;
        }
        executeRecaptcha!("upload").then((token) => {
          file.push(
            <ShowFile
              file={files[i]}
              key={file.length}
              recaptchaToken={token}
            />
          );
          this.setState({ file });
        });
      }
    }
  }

  fileSelected(e: FormEvent<HTMLLabelElement>) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    this.addFiles(target.files!);
  }

  render() {
    const { file, isWarningOpen, excess } = this.state;
    return (
      <Dropzone onDrop={this.onDrop}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <AccountContext.Consumer>
            {(value) => (
              <>
                <div className="flex lg:justify-center items-center lg:h-screen flex-col pt-[120px] lg:pt-0">
                  <div className="shadow-xl p-5 flex flex-col md:flex-row-reverse gap-2 lg:w-3/4 w-full xl:w-1/2 lg:min-h-[400px] max-h-[80vh] overflow-y-auto border border-slate-300 rounded-xl">
                    <div className="md:basis-1/3 flex flex-col gap-2">
                      <div
                        {...getRootProps()}
                        className={`border-dashed border-2 rounded-md justify-center items-center p-5 flex-auto hidden md:flex ${
                          isDragActive
                            ? "border-blue-600 bg-blue-100"
                            : "border-slate-600"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <p>ファイルをドラッグ&ドロップ</p>
                      </div>
                      <p className="text-center text-2xl hidden md:block">or</p>
                      <label
                        htmlFor="upload"
                        className="transition p-2 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block w-full text-center"
                        onChange={this.fileSelected.bind(this)}
                      >
                        <FontAwesomeIcon icon={faUpload} className="pr-2" />
                        ファイルをアップロード
                        <input
                          type="file"
                          id="upload"
                          className="hidden"
                          multiple
                        />
                      </label>
                      <p className="text-lg text-red-500" hidden={!excess}>
                        一度に送信できるファイルは10件までです！
                      </p>
                    </div>
                    <div className="border-r border-t border-slate-200 border-2" />
                    <div
                      className={`flex gap-2 basis-2/3 flex-col overflow-auto ${
                        file.length === 0 ? " items-center justify-center" : ""
                      }`}
                    >
                      {file.length !== 0 ? (
                        file
                      ) : (
                        <FontAwesomeIcon
                          icon={faFolder}
                          className="h-1/2 w-1/2 md:h-1/2 md:w-1/2"
                          color="rgb(226 232 240)"
                        />
                      )}
                    </div>
                  </div>
                  {value.AccountState == null && isWarningOpen ? (
                    <div className="md:relative bg-yellow-200/[.8] md:m-3 p-2 rounded border-2 border-yellow-300 lg:w-3/4 w-full xl:w-1/2 fixed bottom-0 left-0 z-10">
                      <FontAwesomeIcon
                        icon={faXmark}
                        onClick={() => this.setState({ isWarningOpen: false })}
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
          </AccountContext.Consumer>
        )}
      </Dropzone>
    );
  }
}

export default withGoogleReCaptcha(index);
