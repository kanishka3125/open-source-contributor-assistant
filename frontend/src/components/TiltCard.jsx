import { useState, useRef } from "react";

/**
 * TiltCard
 * --------
 * Provides a sleek, professional 3D perspective tilt and dynamic specular
 * surface reflection on mouse move.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  scale = 1.015,
  onClick,
  style = {},
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: "transform 0.1s ease-out",
    });

    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        ...tiltStyle,
        position: "relative",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {/* Dynamic Specular Glare Layer */}
      <div
        className="tilt-glare-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 60%)`,
          transition: "opacity 0.3s ease",
          zIndex: 10,
        }}
      />
    </div>
  );
}
