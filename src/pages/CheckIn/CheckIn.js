import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { extendMoment } from "moment-range";
import { useAuth } from "../../context/authContext";
import "./CheckIn.css";

extendMoment(moment);

const API_BASE_URL = 'http://localhost:8000/api';

const CheckIn = () => {
  const currentYear = moment().year();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(moment().month() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const [checkinRecords, setCheckinRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const today = moment([selectedYear, selectedMonth - 1]);
  const startOfMonth = today.clone().startOf("month");
  const endOfMonth = today.clone().endOf("month");
  const { user } = useAuth();

  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccessMessage("");
    } else {
      setSuccessMessage(message);
      setError("");
    }
    // 3秒後清除訊息
    setTimeout(() => {
      if (isError) {
        setError("");
      } else {
        setSuccessMessage("");
      }
    }, 3000);
  };

  const fetchCheckinRecords = useCallback(async () => {
    if (!user?.token) {
      showMessage("請先登入後再查看簽到記錄", true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/checkin/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCheckinRecords(data.records);
      } else {
        const errorData = await response.json();
        showMessage(`查詢失敗: ${errorData.detail || '未知錯誤'}`, true);
      }
    } catch (error) {
      showMessage("網路連線錯誤，請稍後再試", true);
      console.error("Failed to fetch checkin records:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, user]);

  useEffect(() => {
    fetchCheckinRecords();
  }, [fetchCheckinRecords]);

  const handleCheckIn = async () => {
    if (!user?.token) {
      showMessage("請先登入後再進行簽到", true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/checkin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          checkin_date: moment().format('YYYY-MM-DD')
        })
      });

      if (response.ok) {
        showMessage("簽到成功！");
        fetchCheckinRecords();
      } else {
        const errorData = await response.json();
        showMessage(`簽到失敗: ${errorData.detail || '未知錯誤'}`, true);
      }
    } catch (error) {
      showMessage("網路連線錯誤，請稍後再試", true);
      console.error("Failed to checkin:", error);
    } finally {
      setLoading(false);
    }
  };

  // 計算日期相關資料
  const weeks = [];
  const days = [];
  const day = startOfMonth.clone().startOf("week");

  while (day.isBefore(endOfMonth.clone().endOf("week"))) {
    days.push(day.clone());
    day.add(1, "day");
  }

  for (let i = 0; i < days.length / 7; i++) {
    weeks.push(days.slice(i * 7, (i + 1) * 7));
  }

  // 動態計算年份範圍（前後5年）
  const years = Array.from(
    { length: 11 }, 
    (_, i) => currentYear - 5 + i
  );

  const months = Array.from(
    { length: 12 }, 
    (_, i) => moment().month(i).format("MM")
  );

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value, 10));
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value, 10));
  };

  const handleSearch = () => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const isCheckedIn = (date) => {
    return checkinRecords.some(record => 
      moment(record.checkin_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD') &&
      record.signed_in === true
    );
  };

  return (
    <div className="checkin-container">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <table className="calendar">
        <thead>
          <tr>
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => (
                <td
                  key={j}
                  className={day.month() === today.month() ? "" : "empty"}
                >
                  <div className="date-container">
                    {day.month() === today.month() ? day.date() : ""}
                    {day.month() === today.month() && isCheckedIn(day) && (
                      <img 
                        src="/images/active-icon.png" 
                        alt="checked in" 
                        className="checkin-icon"
                      />
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="controls">
        <div className="select-container">
          <label>
            <select value={year} onChange={handleYearChange}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            年
          </label>
          <label>
            <select value={month} onChange={handleMonthChange}>
              {months.map((m, index) => (
                <option key={m} value={index + 1}>
                  {m}
                </option>
              ))}
            </select>
            月
          </label>
          <button 
            className="search-button" 
            onClick={handleSearch} 
            disabled={loading}
          >
            {loading ? '查詢中...' : '查詢'}
          </button>
        </div>

        <button 
          className="checkin-button" 
          onClick={handleCheckIn}
          disabled={loading || isCheckedIn(moment())}
        >
          {loading ? '處理中...' : '簽到'}
        </button>
      </div>
    </div>
  );
};

export default CheckIn;