import React from "react";
import "./Records.css";

const Records = () => {
  const headers = [
    "部位",
    "遊玩日期",
    "關卡名稱",
    "開始時間",
    "遊玩時間",
    "鍛鍊次數",
    "獲得金幣",
  ];

  const rows = Array(5).fill({
    part: "部位",
    playDate: "yyyy/mm/dd",
    levelName: "上舉",
    startTime: "hh:mm:ss",
    playDuration: "ss",
    exerciseCount: "87",
    coinsEarned: "87",
  });

  return (
    <div className="records-container">
      <div className="records-button-container">
        <button>上肢</button>
        <button>下肢</button>
        <button>四肢</button>
        <button>手部</button>
      </div>
      <div className="records-table-container">
        <table className="records-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row.part}</td>
                <td>{row.playDate}</td>
                <td>{row.levelName}</td>
                <td>{row.startTime}</td>
                <td>{row.playDuration}</td>
                <td>{row.exerciseCount}</td>
                <td>{row.coinsEarned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="export-button-container">
        <button className="export-button">匯出 CSV</button>
      </div>
    </div>
  );
};

export default Records;
