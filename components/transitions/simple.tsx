import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { gsap, Power1, Power2 } from "gsap";
import { SlowMo } from "gsap/dist/EasePack";
import Hotdog from "../../public/hotdog.svg";

type Props = {
  isTransitioning: boolean;
  setIsTransitioning: Dispatch<SetStateAction<boolean>>;
};

const SimpleTransition: FC<Props> = ({
  isTransitioning,
  setIsTransitioning,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hotdogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.set(".circle", { scale: "0" });
    if (!isTransitioning) return;
    const scale = Math.max(window.innerWidth, window.innerHeight);
    gsap
      .timeline()
      .set(hotdogRef.current, { display: "block" })
      .fromTo(
        ".circle",
        { scale: "0" },
        {
          scale: scale / 50,
          duration: 0.5,
          ease: Power1.easeInOut,
          stagger: {
            each: 0.1,
            ease: SlowMo.ease.config(0.7, 0.7, false),
          },
        }
      )
      .to(
        hotdogRef.current,
        {
          bottom: "50vh",
          duration: 1,
          ease: Power2.easeOut,
        },
        "-=0.5"
      )
      .to(
        hotdogRef.current,
        {
          rotate: 360,
          duration: 0.5,
          ease: Power2.easeOut,
        },
        "-=0.1"
      )
      .to(
        hotdogRef.current,
        {
          bottom: "-300px",
          duration: 0.5,
          ease: Power2.easeIn,
        },
        "<0.2"
      )
      .set(hotdogRef.current, { rotate: 0 })
      .to(
        ".circle",
        {
          scale: "0",
          duration: 0.5,
          ease: Power1.easeInOut,
          stagger: {
            each: 0.1,
            from: "end",
            ease: SlowMo.ease.config(0.7, 0.7, false),
          },
        },
        "-=0.5"
      )
      .set(hotdogRef.current, { display: "none" })
      .then(() => setIsTransitioning(false));

    setIsOpen(!isOpen);
  }, [isTransitioning]);

  return (
    <div
      className={`fixed flex justify-center items-center w-screen h-screen top-0 left-0 z-30 pointer-events-none ${
        !isTransitioning ? "hidden" : ""
      }`}
    >
      <div className="relative">
        <svg className="circle absolute fill-lime-400 w-[100px] h-[100px] top-[-50px] left-[-50px]">
          <circle cx="50" cy="50" r="50" strokeWidth="5" />
        </svg>
        <svg className="circle absolute fill-yellow-400 w-[100px] h-[100px] top-[-50px] left-[-50px]">
          <circle cx="50" cy="50" r="50" strokeWidth="5" />
        </svg>
        <svg className="circle absolute fill-amber-400 w-[100px] h-[100px] top-[-50px] left-[-50px]">
          <circle cx="50" cy="50" r="50" strokeWidth="5" />
        </svg>
        <svg className="circle absolute fill-orange-400 w-[100px] h-[100px] top-[-50px] left-[-50px]">
          <circle cx="50" cy="50" r="50" strokeWidth="5" />
        </svg>
        <div
          className="fixed w-[300px] h-[300px] left-[calc(50vw_-_150px)] z-30"
          style={{ bottom: "-300px" }}
          ref={hotdogRef}
        >
          <Hotdog />
        </div>
      </div>
    </div>
  );
};

export default SimpleTransition;
