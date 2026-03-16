import React from 'react'

interface Props {
  className?: string;
  fill?: string;
}

const IconPriceTag = ({ className, fill = "#000000" }: Props) => {
  return (
    <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12.6563 1.375L21.0938 9.8125C21.7188 10.4375 21.7188 11.4297 21.0938 12.0547L13.0859 20.0625C12.4609 20.6875 11.4688 20.6875 10.8438 20.0625L2.40625 11.625C2.09375 11.3125 1.9375 10.8828 1.9375 10.4531V3.4375C1.9375 2.53906 2.66016 1.8125 3.5625 1.8125H10.5781C11.0078 1.8125 11.3438 1.98047 11.6563 2.27344L12.6563 1.375ZM6.5625 8.25C7.46094 8.25 8.1875 7.52344 8.1875 6.625C8.1875 5.72266 7.46094 5 6.5625 5C5.65234 5 4.9375 5.72266 4.9375 6.625C4.9375 7.52344 5.65234 8.25 6.5625 8.25Z" fill={fill}/>
    </svg>
  )
}

export default IconPriceTag
