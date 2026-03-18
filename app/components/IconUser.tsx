import React from "react";

interface Props {
  className?: string;
  fill?: string;
}

const IconUser = ({ className, fill = "#1E293B" }: Props) => {
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
        d="M22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0ZM22 10C25.866 10 29 13.134 29 17C29 20.866 25.866 24 22 24C18.134 24 15 20.866 15 17C15 13.134 18.134 10 22 10ZM22 40C17.1 40 12.71 37.82 9.82 34.36C11.66 31.46 14.82 29.5 18.5 29.5C18.69 29.5 18.88 29.53 19.06 29.58C20 29.86 20.98 30 22 30C23.02 30 24.01 29.86 24.94 29.58C25.12 29.53 25.31 29.5 25.5 29.5C29.18 29.5 32.34 31.46 34.18 34.36C31.29 37.82 26.9 40 22 40Z"
        fill={fill}
      />
    </svg>
  );
};

export default IconUser;
