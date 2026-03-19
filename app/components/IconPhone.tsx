import React from "react";

interface Props {
  className?: string;
  fill?: string;
}

const IconPhone = ({ className, fill = "#000000" }: Props) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="5" y="2" width="14" height="20" rx="2" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 18H12.01" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default IconPhone;
