import React from 'react'

interface Props {
  className?: string;
  fill?: string;
}

const IconBack = ({ className, fill = "#FFFFFF" }: Props) => {
  return (
    <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M11.5 0C5.70156 0 1 4.70156 1 10.5C1 16.2984 5.70156 21 11.5 21C17.2984 21 22 16.2984 22 10.5C22 4.70156 17.2984 0 11.5 0ZM14.2656 15.4781L8.30469 10.5L14.2656 5.52187V15.4781Z" fill={fill}/>
    </svg>
  )
}

export default IconBack
