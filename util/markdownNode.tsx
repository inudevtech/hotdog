import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";

export const H1 = (props: { children?: ReactNode }) => {
  const { children } = props;
  return (
    <h1 className="text-blue-600 text-3xl font-bold border-l-4 border-slate-400 pl-1 m-2 ml-0">
      {children}
    </h1>
  );
};

export const H2 = (props: { children?: ReactNode }) => {
  const { children } = props;
  return <h2 className="text-2xl">{children}</h2>;
};

export const P = (props: { children?: ReactNode }) => {
  const { children } = props;

  return <p className="p-3">{children}</p>;
};

export const Li = (props: { children?: ReactNode }) => {
  const { children } = props;
  return (
    <li className="px-6 py-1">
      <FontAwesomeIcon icon={faCircleChevronRight} /> {children}
    </li>
  );
};

H1.defaultProps = {
  children: null,
};

H2.defaultProps = {
  children: null,
};

P.defaultProps = {
  children: null,
};

Li.defaultProps = {
  children: null,
};
