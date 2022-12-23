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
    gsap
      .timeline()
      .fromTo(
        ".circle",
        { scale: "0" },
        {
          scale: "1",
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
        "<"
      )
      .then(() => setIsTransitioning(false));

    setIsOpen(!isOpen);
    // console.log("a");
  }, [isTransitioning]);

  return (
    <>
      <svg className="circle fixed top-[min(-50vh,-50vw)] left-[min(-50vh,-50vw)] z-20 fill-lime-400 w-[max(200vh,200vw)] h-[max(200vh,200vw)]">
        <circle
          cx="max(100vh,100vw)"
          cy="max(100vh,100vw)"
          r="max(100vh,100vw)"
          strokeWidth="5"
        />
      </svg>
      <svg className="circle fixed top-[min(-50vh,-50vw)] left-[min(-50vh,-50vw)] z-20 fill-yellow-400 w-[max(200vh,200vw)] h-[max(200vh,200vw)]">
        <circle
          cx="max(100vh,100vw)"
          cy="max(100vh,100vw)"
          r="max(100vh,100vw)"
          strokeWidth="5"
        />
      </svg>
      <svg className="circle fixed top-[min(-50vh,-50vw)] left-[min(-50vh,-50vw)] z-20 fill-amber-400 w-[max(200vh,200vw)] h-[max(200vh,200vw)]">
        <circle
          cx="max(100vh,100vw)"
          cy="max(100vh,100vw)"
          r="max(100vh,100vw)"
          strokeWidth="5"
        />
      </svg>
      <svg className="circle fixed top-[min(-50vh,-50vw)] left-[min(-50vh,-50vw)] z-20 fill-orange-400 w-[max(200vh,200vw)] h-[max(200vh,200vw)]">
        <circle
          cx="max(100vh,100vw)"
          cy="max(100vh,100vw)"
          r="max(100vh,100vw)"
          strokeWidth="5"
        />
      </svg>
      <div
        className="fixed w-[300px] h-[300px] left-[calc(50vw_-_150px)] z-30"
        style={{ bottom: "-300px" }}
        ref={hotdogRef}
      >
        <Hotdog />
      </div>
    </>
  );
};

export default SimpleTransition;
