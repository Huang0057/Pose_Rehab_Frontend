import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./FootGame.css";

const FootGame = () => {
  const location = useLocation();
  const selectedDifficulty = location.state?.selectedDifficulty || 'easy';

  const getThresholdAngle = (difficulty) => {
    switch(difficulty) {
      case 'easy':
        return 15;
      case 'medium':
        return 45;
      case 'hard':
        return 70;
      default:
        return 15;
    }
  };

  const thresholdAngle = getThresholdAngle(selectedDifficulty);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);

  const stageRef = useRef('down');
  const [raiseCount, setRaiseCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loadingState, setLoadingState] = useState({
    status: 'loading',
    message: '正在初始化...'
  });

  const calculateLegAngle = (hip, knee, ankle) => {
    // 計算腿部向量（從髖關節到腳踝）
    const legVector = {
      x: ankle.x - hip.x,
      y: ankle.y - hip.y
    };
    
    // 計算垂直向下的向量
    const downVector = { x: 0, y: 1 };
    
    // 計算向量點積
    const dot = legVector.x * downVector.x + legVector.y * downVector.y;
    const legLength = Math.sqrt(legVector.x * legVector.x + legVector.y * legVector.y);
    const downLength = Math.sqrt(downVector.x * downVector.x + downVector.y * downVector.y);
    
    // 計算角度
    const rad = Math.acos(dot / (legLength * downLength));
    const deg = rad * (180 / Math.PI);
    
    // 根據腳的位置決定角度的正負
    return legVector.x > 0 ? -deg : deg;
  };

  const onResults = (results) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx || !results.image) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
      import("@mediapipe/drawing_utils").then(({ drawConnectors, drawLandmarks }) => {
        import("@mediapipe/pose").then(({ POSE_CONNECTIONS }) => {
          drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: "white",
            lineWidth: 4,
          });
          drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: "red",
            radius: 5,
          });
        });
      });

      const leftHip = results.poseLandmarks[23];
      const leftKnee = results.poseLandmarks[25];
      const leftAnkle = results.poseLandmarks[27];

      const visibilityThreshold = 0.5;
      if (leftHip.visibility > visibilityThreshold && 
          leftKnee.visibility > visibilityThreshold && 
          leftAnkle.visibility > visibilityThreshold) {
        
        const angle = calculateLegAngle(leftHip, leftKnee, leftAnkle);
        setCurrentAngle(angle);

        const absAngle = Math.abs(angle);
        if (absAngle >= thresholdAngle && stageRef.current === 'down') {
            stageRef.current = 'up';
            setRaiseCount(prev => prev + 1);
        } else if (absAngle < 5) {
            stageRef.current = 'down';
        }
      }
    }
    canvasCtx.restore();
  };
  
  useEffect(() => {
    let isMounted = true;

    const initializePoseDetection = async () => {
      try {
        setLoadingState({ status: 'loading', message: '正在載入 MediaPipe 模組...' });

        const [{ Pose }, { Camera }] = await Promise.all([
          import("@mediapipe/pose"),
          import("@mediapipe/camera_utils")
        ]);

        if (!isMounted) return;

        setLoadingState({ status: 'loading', message: '正在初始化姿勢檢測...' });

        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        await pose.initialize();

        if (!isMounted) {
          pose.close();
          return;
        }

        pose.onResults(onResults);
        poseRef.current = pose;

        setLoadingState({ status: 'loading', message: '正在啟動相機...' });

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
          });

          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }

          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });

          await camera.start();
          cameraRef.current = camera;

          setLoadingState({ status: 'ready', message: '' });
        } catch (error) {
          if (error.name === 'NotAllowedError') {
            setLoadingState({ 
              status: 'error', 
              message: '請允許使用相機權限以開始遊戲'
            });
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setLoadingState({
            status: 'error',
            message: error.message || '初始化失敗，請重新整理頁面試試'
          });
        }
      }
    };

    initializePoseDetection();

    return () => {
      isMounted = false;
      
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      
      if (poseRef.current) {
        poseRef.current.close();
      }
      
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getInstructions = () => {
    switch(selectedDifficulty) {
      case 'easy':
        return [
          "坐在椅子上，保持穩定。",
          "一隻腳向前抬起約 15 度角。",
          "緩慢放下回到起始位置。",
          "動作完整次數 10 次。",
        ];
      case 'medium':
        return [
          "坐在椅子上，保持穩定。",
          "一隻腳向前抬起約 45 度角。",
          "緩慢放下回到起始位置。",
          "動作完整次數 10 次。",
        ];
      case 'hard':
        return [
          "坐在椅子上，保持穩定。",
          "一隻腳向前抬起約 70 度角。",
          "緩慢放下回到起始位置。",
          "動作完整次數 10 次。",
        ];
      default:
        return [];
    }
  };

  return (
    <div className="container">
      <div className="pose-game-container">
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            display: "none",
            width: "640px",
            height: "480px"
          }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ border: "1px solid black" }}
        />
        
        {loadingState.status === 'loading' && (
          <div className="loading-state">
            <p>{loadingState.message}</p>
          </div>
        )}
        
        {loadingState.status === 'error' && (
          <div className="error-state">
            <p>錯誤：{loadingState.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              重新整理
            </button>
          </div>
        )}
        
        {loadingState.status === 'ready' && (
          <>
            <div className="counter-display">
              <div className="counter-box">
                <span className="counter-label">抬腿次數</span>
                <span className="counter-number">{raiseCount}</span>
                <span className="current-angle">角度: {Math.round(currentAngle)}°</span>
              </div>
            </div>
            <div className="instructions">
              <h3>運動指示：</h3>
              <ul>
                {getInstructions().map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FootGame;