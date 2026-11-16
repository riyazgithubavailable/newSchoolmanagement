import React from 'react'
import { createPortal } from 'react-dom'

type Props = {
    children : React.ReactNode,
    bg : string,
    animation? : string,
    width : string,
    id?:string
    classes?:string
}

export const PopOver = ({children, bg, animation, width,id} : Props) => {
    
  return (
    createPortal(
    <main className={`${width} min-h-screen  z-[10000] overflow-hidden  top-0 fixed inset-0 justify-center items-center ${bg} ${animation}`}>
        {children}
    </main>, 
    document.querySelector("#modal") as Element
  )
  )
}