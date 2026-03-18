import React from "react";

interface Props {
  className?: string;
  fill?: string;
}

const IconLock = ({ className, fill = "#000000" }: Props) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M21 10H19.5V7C19.5 3.13401 16.366 0 12.5 0C8.63401 0 5.5 3.13401 5.5 7V10H4C1.79086 10 0 11.7909 0 14V26C0 28.2091 1.79086 30 4 30H21C23.2091 30 25 28.2091 25 26V14C25 11.7909 23.2091 10 21 10ZM8.5 7C8.5 4.79086 10.2909 3 12.5 3C14.7091 3 16.5 4.79086 16.5 7V10H8.5V7ZM22 26C22 26.5523 21.5523 27 21 27H4C3.44772 27 3 26.5523 3 26V14C3 13.4477 3.44772 13 4 13H21C21.5523 13 22 13.4477 22 14V26ZM14 20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20C10 18.8954 10.8954 18 12 18C13.1046 18 14 18.8954 14 20Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconLock;
