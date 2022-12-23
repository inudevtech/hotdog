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
    <input type="checkbox" className="modal-toggle" checked={isOpen} readOnly />
    <div className="modal modal-bottom sm:modal-middle">
      <div
        className={`modal-box relative ${
          className?.includes(" max-w") ? "" : "max-w-full"
        } ${className}`}
      >
        <FontAwesomeIcon
          icon={faXmark}
          onClick={() => setOpen(false)}
          className="btn btn-xs btn-circle absolute right-2 top-2"
        />
        <div>{children}</div>
      </div>
    </div>
  </div>
);

export default modal;
