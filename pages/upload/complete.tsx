/// <reference path="../../@types/index.d.ts" />
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/dist/CustomEase";
import Car from "../../public/animations/car.svg";

const Complete = () => {
  const router = useRouter();
  const { id } = router.query;
  const carRef = useRef<HTMLDivElement>(null);
  if (id === undefined) router.replace("/upload/");

  useEffect(() => {
    gsap
      .timeline()
      .from(carRef.current, { right: "100vw", duration: 1 })
      .to(
        carRef.current,
        {
          skewX: 15,
          duration: 1,
          ease: CustomEase.create(
            "custom",
            "M0,0 C0.1,0 0,1 0.5,1 1,1 0.9,0 1,0 "
          ),
        },
        "<"
      );
  });

  return (
    <>
      <div className="pt-[120px] sm:pt-[100px] px-2 flex flex-col items-center gap-3 w-full relative z-10 backdrop-blur">
        <h1 className="text-[7vw] leading-none sm:text-5xl my-2 font-bold">
          アップロードが完了しました
        </h1>
        <p>https://hotdog.inu-dev.tech/d/{id}</p>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-[80%] max-w-[1024px]">
          <button className="btn btn-primary grow" type="button">
            ダウンロードリンクを共有
          </button>
          <button className="btn btn-outline grow" type="button">
            ダウンロードリンクをコピー
          </button>
        </div>
      </div>
      <div
        className="w-[150px] absolute top-[min(70vh,300px)]"
        style={{ right: "10vw" }}
        ref={carRef}
      >
        <Car />
      </div>
    </>
  );
};

export default Complete;
