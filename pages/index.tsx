import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  FormEvent, Component, ReactElement,
} from 'react';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { IWithGoogleReCaptchaProps, withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Dropzone from 'react-dropzone';
import ShowFile from '../components/ShowFile';
import Header from '../components/Header';
import { AccountContext } from './_app';

interface indexProps {
  file: ReactElement[],
  isWarningOpen: boolean,
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
    };
  }

  addFiles(files: FileList|File[]) {
    const { file } = this.state;
    const { executeRecaptcha } = (this.props as unknown as IWithGoogleReCaptchaProps)
      .googleReCaptchaProps;

    // Recaptcha認証を行う
    if (executeRecaptcha) {
      executeRecaptcha!('upload').then((token) => {
        for (let i = 0; i < files.length!; i += 1) {
          file.push(<ShowFile
            file={files[i]}
            key={file.length}
            recaptchaToken={token}
          />);
        }
        this.setState({ file });
      });
    }
  }

  fileSelected(e: FormEvent<HTMLLabelElement>) {
    const target = (e.target as HTMLInputElement);
    if (!target.files || target.files.length === 0) return;
    this.addFiles(target.files!);
  }

  render() {
    const { file, isWarningOpen } = this.state;
    return (
      <Dropzone onDrop={this.onDrop}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <AccountContext.Consumer>
            {(value) => (
              <>
                <Header />
                <div className="flex justify-center items-center h-screen flex-col">
                  <div
                    className="shadow-xl p-5 flex flex-col md:flex-row-reverse gap-2 lg:w-3/4 w-full xl:w-1/2 min-h-[400px] border border-slate-300 rounded-xl"
                  >
                    <div className="basis-1/3 flex flex-col">
                      <div
                        {...getRootProps()}
                        className={`border-dashed border-2 rounded-md flex justify-center items-center p-5 flex-auto ${isDragActive ? 'border-blue-600 bg-blue-100' : 'border-slate-600'}`}
                      >
                        <input {...getInputProps()} />
                        <p>
                          ファイルをドラッグ&ドロップ
                        </p>
                      </div>
                      <p className="text-center text-2xl">or</p>
                      <label
                        htmlFor="upload"
                        className="transition p-2 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block w-full text-center"
                        onChange={this.fileSelected.bind(this)}
                      >
                        <FontAwesomeIcon icon={faUpload} className="pr-2" />
                        ファイルをアップロード
                        <input type="file" id="upload" className="hidden" multiple />
                      </label>
                    </div>
                    <div className="border-r border-t border-slate-200 border-2" />
                    <div
                      className={`flex gap-2 basis-2/3 flex-col ${file.length === 0 ? ' items-center justify-center' : ''}`}
                    >
                      {file.length !== 0 ? file
                        : (
                          <FontAwesomeIcon
                            icon={faFolder}
                            className="h-1/2 w-1/2 md:h-1/2 md:w-1/2"
                            color="rgb(226 232 240)"
                          />
                        )}
                    </div>
                  </div>
                  {value.AccountState == null && isWarningOpen ? (
                    <div
                      className="bg-yellow-200/[.6] md:m-3 p-2 rounded border-2 border-yellow-300 lg:w-3/4 w-full xl:w-1/2 fixed bottom-0 left-0 md:static z-10"
                    >
                      <FontAwesomeIcon icon={faXmark} onClick={() => this.setState({ isWarningOpen: false })} className="p-1 cursor-pointer absolute top-0 right-0 md:hidden" />
                      <p className="text-xl">ログインせずにホットドッグを使用しています</p>
                      <p className="text-red-500">
                        ログインしていない状態でアップロードされたファイルは7日後に自動的に削除されます！
                      </p>
                    </div>
                  ) : null}
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
