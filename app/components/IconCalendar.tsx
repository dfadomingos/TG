import React from 'react'

interface Props {
  className?: string;
  fill?: string;
}

const IconCalendar = ({ className, fill = "#FFFFFF" }: Props) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6.5 1V2.5H13.5V1H15V2.5H17.5C18.3284 2.5 19 3.17157 19 4V17.5C19 18.3284 18.3284 19 17.5 19H2.5C1.67157 19 1 18.3284 1 17.5V4C1 3.17157 1.67157 2.5 2.5 2.5H5V1H6.5ZM17.5 8H2.5V17.5H17.5V8ZM6.25 13.75V15.25H4.75V13.75H6.25ZM10.75 13.75V15.25H9.25V13.75H10.75ZM15.25 13.75V15.25H13.75V13.75H15.25ZM6.25 9.75V11.25H4.75V9.75H6.25ZM10.75 9.75V11.25H9.25V9.75H10.75ZM15.25 9.75V11.25H13.75V9.75H15.25ZM5 4H2.5V6.5H17.5V4H15V5.5H13.5V4H6.5V5.5H5V4Z" fill={fill}/>
    </svg>
  )
}

export default IconCalendar
