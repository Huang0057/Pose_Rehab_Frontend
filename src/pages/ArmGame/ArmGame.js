import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ArmGame.css";
import descriptions from "../GameDescription/descriptions";

const ArmGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDifficulty = location.state?.selectedDifficulty || 'easy';

  const getInstructions = () => {
    return descriptions.upperBody[selectedDifficulty] || [];
  };
  const getThresholdAngle = (difficulty) => {
    switch(difficulty) {
      case 'easy':
        return 20;
      case 'medium':
        return 45;
      case 'hard':
        return 70;
      default:
        return 20;
    }
  };
  const handleBack = () => {
    navigate(-1);
  };

  const handleEndGame = () => {
    navigate('/endgame');
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

  const calculateArmAngle = (shoulder, elbow) => {
    const armVector = {
      x: elbow.x - shoulder.x,
      y: elbow.y - shoulder.y
    };
    
    const downVector = { x: 0, y: 1 };
    
    const dot = armVector.x * downVector.x + armVector.y * downVector.y;
    const armLength = Math.sqrt(armVector.x * armVector.x + armVector.y * armVector.y);
    const downLength = Math.sqrt(downVector.x * downVector.x + downVector.y * downVector.y);
    
    const rad = Math.acos(dot / (armLength * downLength));
    const deg = rad * (180 / Math.PI);
    
    return armVector.x < 0 ? deg : -deg;
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

      const leftShoulder = results.poseLandmarks[11];
      const leftElbow = results.poseLandmarks[13];
      const leftWrist = results.poseLandmarks[15];

      const visibilityThreshold = 0.5;
      if (leftShoulder.visibility > visibilityThreshold && 
          leftElbow.visibility > visibilityThreshold && 
          leftWrist.visibility > visibilityThreshold) {
        
        const angle = calculateArmAngle(leftShoulder, leftElbow);
        const absAngle = Math.abs(angle);
        setCurrentAngle(absAngle);

        if (absAngle >= thresholdAngle && stageRef.current === 'down') {
            stageRef.current = 'up';
            setRaiseCount(prev => prev + 1);
        } else if (absAngle < 10) {
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
            width: 800,
            height: 600
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

  return (
    <div className="armgame-container">
      <button onClick={handleBack} className="back-button">
        返回
      </button>
      
      <div className="pose-game-container">
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            display: "none",
            width: "800px",
            height: "600px"
          }}
        />
        <canvas
          ref={canvasRef}
          width="800"
          height="600"
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
            <div className="arm-counter-display">
              <div className="arm-counter-box">
                <span className="arm-counter-label">舉手次數</span>
                <span className="arm-counter-number">{raiseCount}</span>
                <span className="current-angle">角度: {Math.round(currentAngle)}°</span>
              </div>
            </div>
            <div className="arm-instructions">
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
      
      <button onClick={handleEndGame} className="end-game-button">
        結束遊戲
      </button>
    </div>
  );
};

export default ArmGame;