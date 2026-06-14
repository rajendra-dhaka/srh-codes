import { ImageResponse } from "next/og";
import { site } from "../lib/site";

export const alt = `${site.name} ecommerce seller tools`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f4f7fb 0%, #ffffff 42%, #e8f7f8 100%)",
          color: "#10243a",
          fontFamily: "Arial, sans-serif",
          padding: 72,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "2px solid #d7e4f2",
            borderRadius: 32,
            background: "rgba(255,255,255,0.9)",
            padding: 56,
            boxShadow: "0 28px 80px rgba(16, 36, 58, 0.14)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <LogoMark />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1 }}>{site.name}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#4f647a" }}>Browser-based seller tools</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.03, letterSpacing: -2 }}>
              Flipkart label cropper, Meesho labels, GST helper and seller analytics
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {["Flipkart crop", "Meesho 4-up / 6-up", "Courier sorting", "GSTR-1 helper"].map((item) => (
                <div
                  key={item}
                  style={{
                    border: "2px solid #cfe0ef",
                    borderRadius: 14,
                    padding: "12px 18px",
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#10243a",
                    background: "#f8fbff",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 22, color: "#64748b", fontWeight: 700 }}>
            Private browser processing for Indian marketplace sellers
          </div>
        </div>
      </div>
    ),
    size,
  );
}

function LogoMark() {
  return (
    <div
      style={{
        width: 112,
        height: 112,
        borderRadius: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #78e2c6 0%, #35b7c8 100%)",
      }}
    >
      <div style={{ position: "relative", display: "flex", width: 70, height: 82, background: "#ffffff" }}>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 28,
            height: 28,
            background: "#ddf7f7",
            clipPath: "polygon(0 0, 100% 100%, 0 100%)",
          }}
        />
        <div style={{ position: "absolute", left: 12, top: 34, width: 46, height: 7, borderRadius: 8, background: "#10243a" }} />
        <div style={{ position: "absolute", left: 12, top: 50, width: 46, height: 7, borderRadius: 8, background: "#10243a" }} />
        <div style={{ position: "absolute", left: 12, top: 66, width: 30, height: 7, borderRadius: 8, background: "#10243a" }} />
      </div>
    </div>
  );
}
