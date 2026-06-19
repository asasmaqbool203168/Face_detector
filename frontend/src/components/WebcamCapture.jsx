import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw } from "lucide-react";

const VIDEO_CONSTRAINTS = {
  width: 640,
  height: 480,
  facingMode: "user",
};

/**
 * WebcamCapture
 * Props:
 *   onCapture(blob) – called with JPEG Blob when user captures
 *   status          – "idle" | "scanning" | "success" | "error"
 *   hideUI          - true to hide the capture button and preview
 */
const WebcamCapture = forwardRef(({ onCapture, status = "idle", hideUI = false }, ref) => {
  const webcamRef = useRef(null);
  const [captured, setCaptured] = useState(null); // data-URL for preview

  const captureImage = useCallback(async () => {
    const dataUrl = webcamRef.current?.getScreenshot({ width: 640, height: 480 });
    if (!dataUrl) return null;
    
    if (!hideUI) {
      setCaptured(dataUrl);
    }

    // Convert data-URL → Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (onCapture) onCapture(blob);
    return blob;
  }, [onCapture, hideUI]);

  useImperativeHandle(ref, () => ({
    capture: captureImage,
    reset: () => {
      setCaptured(null);
      if (onCapture) onCapture(null);
    }
  }));

  const handleRetake = () => {
    setCaptured(null);
    if (onCapture) onCapture(null);
  };

  if (captured && !hideUI) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <img src={captured} alt="Captured face" className="captured-preview" />
        <button type="button" className="btn btn-ghost btn-full" onClick={handleRetake}>
          <RefreshCw size={16} /> Retake Photo
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div className={`webcam-wrapper ${status}`}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          videoConstraints={VIDEO_CONSTRAINTS}
          mirrored={true}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="scan-overlay">
          <div className="scan-frame" />
        </div>
      </div>

      {!hideUI && (
        <button type="button" className="btn btn-primary btn-full" onClick={captureImage}>
          <Camera size={17} />
          Capture Photo
        </button>
      )}
    </div>
  );
});

export default WebcamCapture;
