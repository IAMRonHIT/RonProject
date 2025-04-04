"use client"

import { Suspense, lazy, forwardRef } from "react"
const Spline = lazy(() => import("@splinetool/react-spline"))

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: (spline: any) => void
}

export const SplineScene = forwardRef<HTMLDivElement, SplineSceneProps>(({ scene, className, onLoad }, ref) => {
  return (
    <div ref={ref} className={className}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <Spline scene={scene} onLoad={onLoad} />
      </Suspense>
    </div>
  )
})

SplineScene.displayName = "SplineScene"

