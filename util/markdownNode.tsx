import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";

export const H1 = (props: { children?: ReactNode }) => {
  const { children } = props;
  return (
    <h1 className="text-blue-600 text-5xl font-bold mb-10 m-5 after:w-16 after:h-4 after:border-b-4 after:border-slate-500 after:block">
      {children}
    </h1>
  );
};

export const H2 = (props: { children?: ReactNode }) => {
  const { children } = props;
  return <h2 className="text-3xl font-bold m-2 ml-0">{children}</h2>;
};

export const H3 = (props: { children?: ReactNode }) => {
  const { children } = props;
  return <h2 className="text-xl">{children}</h2>;
};

export const P = (props: { children?: ReactNode }) => {
  const { children } = props;

  return <p>{children}</p>;
};

export const Li = (props: { children?: ReactNode }) => {
  const { children } = props;
  return (
    <div className="px-6 py-1">
      <FontAwesomeIcon icon={faCircleChevronRight} /> {children}
    </div>
  );
};

H1.defaultProps = {
  children: null,
};

H2.defaultProps = {
  children: null,
};

H3.defaultProps = {
  children: null,
};

P.defaultProps = {
  children: null,
};

Li.defaultProps = {
  children: null,
};
