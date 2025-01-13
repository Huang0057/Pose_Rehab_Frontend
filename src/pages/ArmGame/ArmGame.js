import React, { useRef, useEffect, useState } from "react";
import "./ArmGame.css";

const ArmGame = ({ selectedDifficulty }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const [raiseCount, setRaiseCount] = useState(0);
  const [stage, setStage] = useState('none');
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loadingState, setLoadingState] = useState({
    status: 'loading',
    message: '正在初始化...'
  });

  // 難度設定
  const difficultyAngles = {
    easy: 20,    // 垂直向下約20度
    medium: 45,  // 斜下45度
    hard: 90,    // 水平90度
  };
  const targetAngle = difficultyAngles[selectedDifficulty] || 45;

  // 計算手臂與垂直向下的夾角
  const calculateArmAngle = (shoulder, elbow) => {
    // 計算手臂向量
    const armVector = {
      x: elbow.x - shoulder.x,
      y: elbow.y - shoulder.y
    };
    
    // 垂直向下的向量
    const downVector = { x: 0, y: 1 };
    
    // 計算夾角（弧度）
    const dot = armVector.x * downVector.x + armVector.y * downVector.y;
    const armLength = Math.sqrt(armVector.x * armVector.x + armVector.y * armVector.y);
    const downLength = Math.sqrt(downVector.x * downVector.x + downVector.y * downVector.y);
    
    let angle = Math.acos(dot / (armLength * downLength)) * (180 / Math.PI);
    
    // 判斷手臂是在左邊還是右邊，以確保角度的正確性
    if (armVector.x < 0) {
      angle = 360 - angle;
    }
    
    // 返回 0-180 範圍的角度
    return angle > 180 ? 360 - angle : angle;
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
      // 繪製姿勢標記
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

      // 獲取左手臂的關鍵點
      const leftShoulder = results.poseLandmarks[11];
      const leftElbow = results.poseLandmarks[13];

      // 驗證關鍵點的可見度
      const visibilityThreshold = 0.5;
      if (leftShoulder.visibility > visibilityThreshold && 
          leftElbow.visibility > visibilityThreshold) {
        
        const angle = calculateArmAngle(leftShoulder, leftElbow);
        setCurrentAngle(Math.round(angle));

        // 更新手臂狀態和計數邏輯
        // 舉手動作計數邏輯
        if (angle < 10) {  // 手臂放下時（接近垂直）
          setStage('down');
        }
        if (angle >= targetAngle && stage === 'down') {  // 達到目標角度且在down階段
          setStage('up');
          setRaiseCount(prev => prev + 1);
        }

        // 除錯信息
        canvasCtx.font = '18px Arial';
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillText(`階段: ${stage}`, 10, 60);
        canvasCtx.fillText(`角度: ${Math.round(angle)}°`, 10, 30);
        canvasCtx.fillText(`目標角度: ${targetAngle}°`, 10, 90);

        // 繪製當前角度（用於除錯）
        canvasCtx.font = '24px Arial';
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillText(`角度: ${Math.round(angle)}°`, 10, 30);
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
  }, []); // 移除不必要的依賴

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
          <div className="counter-display">
            <div className="counter-box">
              <span className="counter-label">舉手次數</span>
              <span className="counter-number">{raiseCount}</span>
              <span className="counter-target">目標角度: {targetAngle}°</span>
              <span className="current-angle">當前角度: {currentAngle}°</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArmGame;