'use client';

import { useState, useEffect, useRef } from 'react';
import { Ros, Topic } from 'roslib';

export default function Home() {
  const [robotUrl, setRobotUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const rosRef = useRef<Ros | null>(null);
  const publisherRef = useRef<Topic | null>(null);

  const handleConnect = () => {
    if (inputValue) {
      setRobotUrl(inputValue);
      setConnected(true);
    }
  };

  useEffect(() => {
    if (!connected || !robotUrl) return;

    // Connect to ROS
    const ros = new Ros({
      url: `ws://${robotUrl}:9090`
    });

    ros.on('connection', () => {
      console.log('Connected to rosbridge');
      
      // Create publisher for movement commands
      const publisher = new Topic({
        ros: ros,
        name: '/usr_cmd',
        messageType: 'std_msgs/String'
      });

      publisherRef.current = publisher;
    });

    ros.on('error', (error) => {
      console.error('ROS connection error:', error);
    });

    ros.on('close', () => {
      console.log('ROS connection closed');
    });

    rosRef.current = ros;

    return () => {
      ros.close();
    };
  }, [connected, robotUrl]);

  useEffect(() => {
    const sendCommand = (message: string) => {
      if (publisherRef.current) {
        console.log("send", message)
        const msg = { data: message };
        publisherRef.current.publish(msg);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!connected) return;

      switch (event.key) {
        case 'ArrowDown':
          sendCommand('back');
          break;
        case 'ArrowUp':
          sendCommand('forward');
          break;
        case 'ArrowLeft':
          sendCommand('left');
          break;
        case 'ArrowRight':
          sendCommand('right');
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!connected) return;
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        sendCommand('stop');
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [connected]);

  const handleShutdown = () => {
    if (publisherRef.current) {
      const msg = { data: 'shutdown' };
      publisherRef.current.publish(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8">Robot Control Interface</h1>
        
        {/* Connection Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter robot URL (e.g., 192.168.1.100)"
              className="flex-1 px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={connected}
            />
            <button 
              onClick={handleConnect}
              disabled={connected}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium"
            >
              {connected ? 'Connected' : 'Connect'}
            </button>
            {connected && (
              <button 
                onClick={handleShutdown}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
              >
                Shutdown
              </button>
            )}
          </div>
        </div>

        {/* Camera Stream */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Camera Stream</h2>
          <div className="bg-gray-700 rounded flex items-center justify-center" style={{ width: 640, height: 480 }}>
            {connected && robotUrl ? (
              <img 
                src={`http://${robotUrl}:8080/stream?topic=/camera/image_raw`}
                alt="Robot camera stream"
                width={640}
                height={480}
              />
            ) : (
              <span className="text-gray-500">Camera stream will appear here</span>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="space-y-2 text-gray-300">
            <p>↑ Arrow Up - Move Forward</p>
            <p>↓ Arrow Down - Move Backward</p>
            <p>← Arrow Left - Turn Left</p>
            <p>→ Arrow Right - Turn Right</p>
            <p className="text-sm text-gray-400 mt-4">Release any key to stop</p>
          </div>
        </div>
      </div>
    </div>
  );
}
