import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, FC, ReactNode, SetStateAction } from "react";
import "animate.css";

type Props = {
  className?: string;
  children: ReactNode;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const modal: FC<Props> = ({ children, className, isOpen, setOpen }) => (
  <div>
    {isOpen && (
      <div className="fixed top-0 left-0 w-full h-full bg-stone-500/50 flex items-center justify-center z-20">
        <div
          className={`bg-white rounded-xl max-h-screen overflow-auto relative shadow-xl animate__animated animate__slideInUp ${className}`}
        >
          <FontAwesomeIcon
            icon={faXmark}
            onClick={() => setOpen(false)}
            className="absolute top-0 right-0 p-2 cursor-pointer"
            size="lg"
          />
          {children}
        </div>
      </div>
    )}
  </div>
);

export default modal;
