import axios, { AxiosRequestConfig } from 'axios';
import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faLink, faPen } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import EditModal from './EditModal';
import { AccountContext } from '../pages/_app';
import { AccountType } from '../util/global';

interface showFileProps {
  file: File,
  recaptchaToken: string
}

interface showFileStateProps {
  progress: number,
  id: string,
  editOpen:boolean
}

class index extends Component<showFileProps, showFileStateProps> {
  // eslint-disable-next-line react/static-property-placement
  context!: AccountType;

  constructor(props: showFileProps | Readonly<showFileProps>) {
    super(props);
    this.state = {
      progress: 0,
      id: '',
      editOpen: false,
    };

    this.setShowFlag = this.setShowFlag.bind(this);
  }

  async componentDidMount() {
    const { file, recaptchaToken } = this.props;

    if (file.size > 1000 * 1000 * 1000 * 5) {
      this.setState({ progress: -2 });
    } else {
      const self = this;

      let accessToken;
      if (this.context == null) {
        accessToken = null;
      } else {
        const { AccountState } = this.context;
        accessToken = await AccountState?.getIdToken();
      }

      const params = {
        type: file.type,
        filename: file.name,
        token: accessToken,
        recaptcha: recaptchaToken,
      };

      const config: AxiosRequestConfig = {
        onUploadProgress(progressEvent) {
          self.setState({ progress: (progressEvent.loaded * 100) / progressEvent.total });
        },
        params,
      };

      axios.post('/api/upload', file, config)
        .then((res) => {
          this.setState({ id: res.data.id });
        }).catch(() => {
          this.setState({ progress: -1 });
        });
    }
  }

  setShowFlag(flag:boolean) {
    this.setState({ editOpen: flag });
  }

  async copyLink() {
    const { id } = this.state;
    await navigator.clipboard.writeText(`https://hotdog.inu-dev.tech/d/${id}`);
  }

  render() {
    const { file } = this.props;
    const { progress, editOpen, id } = this.state;

    let showItem;
    if (progress === -2) {
      showItem = (
        <Tippy content="ファイルが大きすぎます！">
          <div
            className="w-full p-[2px] border border-red-300 rounded overflow-hidden whitespace-nowrap bg-red-200"
          >
            <FontAwesomeIcon icon={faCircleExclamation} className="mx-2" />
            ファイルが大きすぎます：
            {file.name}
          </div>
        </Tippy>
      );
    } else if (progress === -1) {
      showItem = (
        <Tippy content="何らかのエラーが発生しました">
          <div
            className="w-full p-[2px] border border-red-300 rounded overflow-hidden whitespace-nowrap bg-red-200"
          >
            <FontAwesomeIcon icon={faCircleExclamation} className="mx-2" />
            {file.name}
          </div>
        </Tippy>
      );
    } else if (progress !== 100) {
      showItem = (
        <>
          <div
            className="w-full p-[2px] border border-slate-300 rounded overflow-hidden whitespace-nowrap"
            style={{ background: `linear-gradient(to right, rgb(129 140 248) ${progress}%, #fff 0` }}
          >
            {file.name}
          </div>
          <span>
            {Math.round(progress)}
            %
          </span>
        </>
      );
    } else {
      showItem = (
        <>
          <span className="overflow-hidden whitespace-nowrap w-full">{file.name}</span>
          <div className="flex gap-1">
            <Tippy content="リンクをクリップボードにコピーしました!" trigger="click">
              <Tippy content="リンクをコピーする">
                <button
                  type="button"
                  className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-green-500"
                  id="url-button"
                  onClick={this.copyLink.bind(this)}
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
                onClick={() => this.setShowFlag(true)}
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
            </Tippy>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between gap-2">
          {showItem}
        </div>
        <EditModal showFlag={editOpen} setFlag={this.setShowFlag} id={id} />
      </>
    );
  }
}
index.contextType = AccountContext;

export default index;
