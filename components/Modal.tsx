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
    <div className="modal">
      <div className="modal-box relative">
        <FontAwesomeIcon
          icon={faXmark}
          onClick={() => setOpen(false)}
          className="btn btn-sm btn-circle absolute right-2 top-2"
          size="lg"
        />
        <div className={className}> 
        {children}
        </div>
      </div>
    </div>
  </div>
);

export default modal;
