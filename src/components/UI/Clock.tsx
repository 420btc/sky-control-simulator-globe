
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Formato de hora: HH:MM:SS
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  // Formato de fecha: DD/MM/YYYY
  const day = time.getDate().toString().padStart(2, '0');
  const month = (time.getMonth() + 1).toString().padStart(2, '0');
  const year = time.getFullYear();
  
  return (
    <div className="flex flex-col items-center bg-atc-darkBg text-atc-yellow rounded-lg p-2 shadow-md">
      <div className="text-xl font-mono">{`${hours}:${minutes}:${seconds}`}</div>
      <div className="text-xs text-white font-medium">{`${day}/${month}/${year}`}</div>
    </div>
  );
};

export default Clock;
