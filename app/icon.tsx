import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1210",
          border: "4px solid #C5A059",
          borderRadius: 14,
          color: "#C5A059",
          fontSize: 25,
          fontWeight: 900,
          letterSpacing: -2,
        }}
      >
        BB
      </div>
    ),
    size,
  );
}
