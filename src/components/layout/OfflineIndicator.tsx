import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { isOnline, syncStatus, pendingCount, syncNow } = useOffline();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`w-full text-xs font-semibold flex items-center justify-center gap-2 py-1 px-4 ${
        !isOnline
          ? 'bg-red-500 text-white'
          : syncStatus === 'syncing'
          ? 'bg-yellow-400 text-yellow-900'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff size={13} />
          <span>ออฟไลน์ — ข้อมูลจะถูกบันทึกไว้ในเครื่องจนกว่าจะมีสัญญาณ</span>
          {pendingCount > 0 && (
            <span className="bg-white/30 rounded-full px-2">รอส่ง {pendingCount} รายการ</span>
          )}
        </>
      ) : syncStatus === 'syncing' ? (
        <>
          <RefreshCw size={13} className="animate-spin" />
          <span>กำลังซิงค์ข้อมูล...</span>
        </>
      ) : (
        <>
          <Wifi size={13} />
          <span>มี {pendingCount} รายการรอส่ง</span>
          <button
            onClick={syncNow}
            className="underline hover:no-underline ml-1"
          >
            ซิงค์เลย
          </button>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
