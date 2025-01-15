import React, { useRef, useEffect, useState } from "react";
import "./ArmGame.css";

const ArmGame = ({ selectedDifficulty }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const lastValidAngleRef = useRef(0);
  const previousAngleRef = useRef(0);  // 追蹤前一個角度
  const [raiseCount, setRaiseCount] = useState(0);
  const [stage, setStage] = useState('down');
  const [canCount, setCanCount] = useState(true);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loadingState, setLoadingState] = useState({
    status: 'loading',
    message: '正在初始化...'
  });

  // 計算手臂與垂直線的夾角
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
    
    // 手臂向下時為 0 度
    const rad = Math.acos(dot / (armLength * downLength));
    const deg = rad * (180 / Math.PI);
    
    // 根據手臂在身體左側還是右側判斷角度
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
        
        const angle = calculateArmAngle(leftShoulder, leftElbow);  // 修正參數順序
        setCurrentAngle(Math.round(angle));

        // 取絕對值來判斷側平舉角度
        const absAngle = Math.abs(angle);
        
        // 只有當角度變化足夠大時才更新狀態，避免抖動
        if (Math.abs(absAngle - lastValidAngleRef.current) > 2) {
          lastValidAngleRef.current = absAngle;
          
          const isRaising = absAngle > previousAngleRef.current;  // 判斷是否正在舉起
          const isLowering = absAngle < previousAngleRef.current;  // 判斷是否正在放下
          
          // 更新前一個角度
          previousAngleRef.current = absAngle;

          // 當手臂接近自然垂放時（小於 5 度）且確實在放下手臂
          if (absAngle < 5 && isLowering) {
            if (stage === 'up') {
              setStage('down');
              setCanCount(true);  // 回到垂放狀態時，允許下一次計數
            }
          }
          // 當達到目標角度且正在舉起手臂
          else if (absAngle >= 20 && isRaising && stage === 'down' && canCount) {
            setStage('up');
            setRaiseCount(prev => prev + 1);
            setCanCount(false);  // 計數後，在回到垂放狀態前不允許再次計數
          }
        }

        canvasCtx.font = '18px Arial';
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillText(`階段: ${stage}`, 10, 60);
        canvasCtx.fillText(`角度: ${Math.round(angle)}°`, 10, 30);
        canvasCtx.fillText(`計數: ${raiseCount}`, 10, 90);
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
              <span className="current-angle">當前角度: {currentAngle}°</span>
              <span className="current-stage">當前階段: {stage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArmGame;