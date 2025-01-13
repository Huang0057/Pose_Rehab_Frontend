import React, { useState } from "react";
import moment from "moment";
import { extendMoment } from "moment-range";
import "./CheckIn.css";

const Moment = extendMoment(moment);

const CheckIn = () => {
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month() + 1); 
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1); 

  const today = moment([selectedYear, selectedMonth - 1]);
  const startOfMonth = today.clone().startOf("month");
  const endOfMonth = today.clone().endOf("month");

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

  const years = Array.from({ length: 10 }, (_, i) => moment().year() - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) =>
    moment().month(i).format("MM")
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

  const handleCheckIn = () => {    
  };

  return (
    <div className="checkin-container">
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
                  {day.month() === today.month() ? day.date() : ""}
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
          <button className="search-button" onClick={handleSearch}>
            查詢
          </button>
        </div>

        <button className="checkin-button" onClick={handleCheckIn}>
          簽到
        </button>
      </div>
    </div>
  );
};

export default CheckIn;
