import Image from "next/image";
import Header from "../components/Header";

const about = () => {
  return (
    <div className="w-[90%] sm:container mx-auto mt-[100px] max-w-[1024px] md-page">
      <Header></Header>
      <div className="hotdog-background">
        <div className="text-4xl flex gap-1 items-center m-2 flex-wrap">
          <Image src="/hotdog-emoji.svg" width="40" height="40" alt="Hotdog Emoji" className="" />
          <span className="item">ホットドッグ</span>
          <span>とは？</span>
        </div>
        犬開発が開発している、次世代ファイル共有サービスです。
        簡単に、多機能に、わかりやすく、を掲げながら開発しています。
      </div>
      <h2>
        ホットドッグの特徴
      </h2>
      <p className="text-center text-4xl">
        ①
      </p>

      - 1クリックで共有完了、2クリックでリンクをコピー！
      - 1ファイル5GBまでアップロード可能！
      - ログインするとタイトルや説明文も入力可能！

      ...などなど、いろいろな機能があります。
    </div>
  )
};

export default about;
