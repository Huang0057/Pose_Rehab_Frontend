import React, { useRef, useEffect, useState } from "react";
import * as mpPose from "@mediapipe/pose";
import * as mpDrawing from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import "./PoseGame.css";

const PoseGame = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pose = new mpPose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    pose.onResults((results) => {
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.poseLandmarks) {
        mpDrawing.drawConnectors(canvasCtx, results.poseLandmarks, mpPose.POSE_CONNECTIONS, {
          color: "white",
          lineWidth: 4,
        });
        mpDrawing.drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "red",
          radius: 5,
        });
      }
    });

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("您的瀏覽器不支援視訊功能");
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error("未檢測到視訊鏡頭設備");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;

        if (videoElement.readyState >= 2) {
          await videoElement.play();
        }

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await pose.send({ image: videoElement });
          },
        });
        camera.start();

        setError(null);

      } catch (error) {
        console.error("視訊鏡頭錯誤:", error);
        setError(error.message || "視訊鏡頭無法使用");
      }
    };

    startCamera();

    return () => {
      if (videoElement.srcObject) {
        const stream = videoElement.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoElement.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="container">
      <div className="pose-game-container">
        {error && (
          <div 
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ display: "none" }}
        ></video>
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ border: "1px solid black" }}
        ></canvas>
      </div>
    </div>
  );
};

export default PoseGame;