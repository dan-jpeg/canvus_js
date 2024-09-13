'use client'

import DrawingTool from "@/app/ui/homepage/DrawingTool";
import { FC } from 'react'

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
      <div className="w-screen h-screen bg-neutral-400 flex justify-center items-center">
        <DrawingTool />
      </div>
  )
}

export default Page