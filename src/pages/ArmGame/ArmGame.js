import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "./ArmGame.css";
import descriptions from "../GameDescription/descriptions";

const ArmGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();
  const selectedDifficulty = location.state?.selectedDifficulty || 'easy';
  const REQUIRED_RAISES = 10;

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const stageRef = useRef('down');
  const gameStartTimeRef = useRef(new Date());
  const gameSubmitted = useRef(false);
  const currentCountRef = useRef(0);

  // State
  const [raiseCount, setRaiseCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loadingState, setLoadingState] = useState({
    status: 'loading',
    message: '正在初始化...'
  });

  const getThresholdAngle = useCallback((difficulty) => {
    switch(difficulty) {
      case 'medium':
        return 45;
      case 'hard':
        return 70;
      default:
        return 20;
    }
  }, []);

  const getInstructions = useCallback(() => {
    return descriptions.upperBody[selectedDifficulty] || [];
  }, [selectedDifficulty]);  
  
  const cleanup = useCallback(() => {
    try {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, []);

  const handleEndGame = useCallback(async (completed = false) => {
    const submitGameRecord = async (completed) => {
      if (!user || gameSubmitted.current) return;
      gameSubmitted.current = true;

      const gameData = {
        part: "上肢",
        play_date: gameStartTimeRef.current.toISOString().split('T')[0],
        level_name: "手臂側平舉",
        start_time: gameStartTimeRef.current.toTimeString().split(' ')[0],
        end_time: new Date().toTimeString().split(' ')[0],
        duration_time: Math.floor((new Date() - gameStartTimeRef.current) / 1000),
        exercise_count: currentCountRef.current,
        coins_earned: completed ? 10 : 0
      };

      try {
        const response = await fetch('http://localhost:8000/api/game/add_records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          credentials: 'include',
          body: JSON.stringify(gameData)
        });

        if (!response.ok) {
          throw new Error('Failed to submit game record');
        }

        if (completed) {
          await updateUserData();
        }
      } catch (error) {
        console.error('Error submitting game record:', error);
        gameSubmitted.current = false;
      }
    };

    try {
      await submitGameRecord(completed);
      cleanup();
      
      navigate('/endgame', {
        state: {
          exerciseCount: currentCountRef.current,
          coinsEarned: completed ? 10 : 0,
          difficulty: "手臂側平舉"
        }
      });
    } catch (error) {
      console.error('Error in handleEndGame:', error);
    }
  }, [cleanup, navigate, user, updateUserData]);

  const handleBack = async () => {
    await handleEndGame(false);
    navigate(-1);
  };

  const calculateArmAngle = useCallback((shoulder, elbow) => {
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
  }, []);

  const onResults = useCallback((results) => {
    const canvasCtx = canvasRef.current?.getContext("2d");
    if (!canvasCtx || !results.image) return;
  
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
  
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
  
        const thresholdAngle = getThresholdAngle(selectedDifficulty);
  
        if (absAngle >= thresholdAngle && stageRef.current === 'down') {
          stageRef.current = 'up';
          
          // 同時更新 ref 和 state
          currentCountRef.current += 1;
          setRaiseCount(currentCountRef.current);
          
          if (currentCountRef.current >= REQUIRED_RAISES) {
            setTimeout(() => {
              handleEndGame(true);
            }, 500);
          }
        } else if (absAngle < 10) {
          stageRef.current = 'down';
        }
      }
    }
    canvasCtx.restore();
  }, [calculateArmAngle, getThresholdAngle, handleEndGame, selectedDifficulty]);

  useEffect(() => {
    let isComponentMounted = true;

    const loadMediaPipeScript = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializePoseDetection = async () => {
      try {
        setLoadingState({ status: 'loading', message: '正在載入 MediaPipe 模組...' });
        
        // 先載入主要的 MediaPipe script
        await loadMediaPipeScript();
        
        if (!isComponentMounted) return;

        // 載入 Camera 模組
        setLoadingState({ status: 'loading', message: '正在載入相機模組...' });
        const { Camera } = await import("@mediapipe/camera_utils");

        if (!isComponentMounted) return;

        // 初始化 Pose
        setLoadingState({ status: 'loading', message: '正在初始化姿勢檢測...' });
        const pose = new window.Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (!isComponentMounted) return;

        pose.onResults(onResults);
        await pose.initialize();
        
        if (!isComponentMounted) {
          pose.close();
          return;
        }

        poseRef.current = pose;

        // 設置相機
        setLoadingState({ status: 'loading', message: '正在啟動相機...' });
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
          });

          if (!isComponentMounted) {
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
        if (isComponentMounted) {
          setLoadingState({
            status: 'error',
            message: '初始化失敗，請重新整理頁面試試'
          });
        }
      }
    };

    initializePoseDetection();

    return () => {
      isComponentMounted = false;
      cleanup();
    };
  }, [cleanup, onResults]);

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
                <span className="arm-counter-number">{raiseCount} / {REQUIRED_RAISES}</span>
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
      
      <button onClick={() => handleEndGame(false)} className="end-game-button">
        結束遊戲
      </button>
    </div>
  );
};

export default ArmGame;