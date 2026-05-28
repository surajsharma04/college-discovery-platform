"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState
} from "react";
import { cn } from "@/lib/utils";

type MagneticProps = HTMLAttributes<HTMLDivElement> & {
  strength?: number;
  rotate?: boolean;
};

export function Magnetic({
  children,
  className,
  strength = 18,
  rotate = false,
  ...props
}: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function reset() {
      setStyle({
        transform:
          "perspective(1100px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)"
      });
    }

    function handleMove(event: MouseEvent) {
      const current = ref.current;
      if (!current) return;

      const bounds = current.getBoundingClientRect();
      const offsetX = event.clientX - (bounds.left + bounds.width / 2);
      const offsetY = event.clientY - (bounds.top + bounds.height / 2);
      const moveX = (offsetX / bounds.width) * strength;
      const moveY = (offsetY / bounds.height) * strength;
      const rotateX = rotate ? (-offsetY / bounds.height) * 7 : 0;
      const rotateY = rotate ? (offsetX / bounds.width) * 7 : 0;

      setStyle({
        transform: `perspective(1100px) translate3d(${moveX}px, ${moveY}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      });
    }

    reset();
    element.addEventListener("mousemove", handleMove);
    element.addEventListener("mouseleave", reset);

    return () => {
      element.removeEventListener("mousemove", handleMove);
      element.removeEventListener("mouseleave", reset);
    };
  }, [rotate, strength]);

  return (
    <div
      ref={ref}
      className={cn("magnetic-shell transform-gpu transition duration-200 ease-out", className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
