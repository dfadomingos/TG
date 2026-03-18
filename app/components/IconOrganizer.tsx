import React from "react";

interface Props {
  className?: string;
  fill?: string;
}

const IconOrganizer = ({ className, fill = "#1E293B" }: Props) => {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M38.5 8.25H33V5.5C33 3.01472 30.9853 1 28.5 1H15.5C13.0147 1 11 3.01472 11 5.5V8.25H5.5C3.01472 8.25 1 10.2647 1 12.75V38.5C1 40.9853 3.01472 43 5.5 43H38.5C40.9853 43 43 40.9853 43 38.5V12.75C43 10.2647 40.9853 8.25 38.5 8.25ZM15.5 5.5H28.5V8.25H15.5V5.5ZM38.5 38.5H5.5V22H16.5V25.5C16.5 26.3284 17.1716 27 18 27H26C26.8284 27 27.5 26.3284 27.5 25.5V22H38.5V38.5ZM27.5 17.5V22H16.5V17.5H5.5V12.75H38.5V17.5H27.5Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconOrganizer;
