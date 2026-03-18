import React from "react";

interface Props {
  className?: string;
  fill?: string;
}

const IconEmail = ({ className, fill = "#000000" }: Props) => {
  return (
    <svg
      width="40"
      height="30"
      viewBox="0 0 40 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M36 0H4C1.79086 0 0 1.79086 0 4V26C0 28.2091 1.79086 30 4 30H36C38.2091 30 40 28.2091 40 26V4C40 1.79086 38.2091 0 36 0ZM36 4L20 17L4 4H36ZM4 26V7.5L20 20.5L36 7.5V26H4Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconEmail;
