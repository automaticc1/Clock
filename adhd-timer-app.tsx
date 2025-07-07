import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, CheckCircle, AlertCircle } from 'lucide-react';

const ADHDTimerApp = () => {
  // Phase states: 'idle', 'activation', 'focus', 'reflection'
  const [phase, setPhase] = useState('idle');
  const [activationTime, setActivationTime] = useState(15 * 60); // 15 minutes in seconds
  const [focusTime, setFocusTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [lastPromptTime, setLastPromptTime] = useState(0);
  
  // Reflection state
  const [reflection, setReflection] = useState({
    meaningful: null,
    perfectionism: null,
    nextTask: ''
  });

  const intervalRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (phase === 'activation') {
          setActivationTime(prev => {
            if (prev <= 1) {
              // Transition to focus phase
              setPhase('focus');
              setFocusTime(0);
              setLastPromptTime(0);
              return 0;
            }
            return prev - 1;
          });
        } else if (phase === 'focus') {
          setFocusTime(prev => {
            const newTime = prev + 1;
            // Check for 10-minute intervals (600 seconds)
            if (newTime > 0 && newTime % 600 === 0 && newTime !== lastPromptTime) {
              setShowPrompt(true);
              setLastPromptTime(newTime);
            }
            return newTime;
          });
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase, lastPromptTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setPhase('activation');
    setActivationTime(15 * 60);
    setFocusTime(0);
    setIsRunning(true);
    setShowPrompt(false);
    setLastPromptTime(0);
    setReflection({ meaningful: null, perfectionism: null, nextTask: '' });
  };

  const stopSession = () => {
    setIsRunning(false);
    setPhase('reflection');
    setShowPrompt(false);
  };

  const finishReflection = () => {
    // Store reflection data in localStorage
    const sessionData = {
      date: new Date().toISOString(),
      activationTime: 15 * 60 - activationTime,
      focusTime: focusTime,
      reflection: reflection
    };
    
    const sessions = JSON.parse(localStorage.getItem('adhd-timer-sessions') || '[]');
    sessions.push(sessionData);
    localStorage.setItem('adhd-timer-sessions', JSON.stringify(sessions));
    
    // Reset to idle
    setPhase('idle');
    setActivationTime(15 * 60);
    setFocusTime(0);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  // Phase-specific styling
  const getPhaseStyles = () => {
    switch (phase) {
      case 'activation':
        return {
          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
          color: 'white',
          accent: '#ff8c42'
        };
      case 'focus':
        return {
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          accent: '#5a67d8'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #2d3748, #4a5568)',
          color: 'white',
          accent: '#4299e1'
        };
    }
  };

  const styles = getPhaseStyles();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500"
      style={{ background: styles.background }}
    >
      <div className="w-full max-w-md mx-auto text-center">
        
        {/* Idle State */}
        {phase === 'idle' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: styles.color }}>
                Focus Timer
              </h1>
              <p className="text-lg opacity-80" style={{ color: styles.color }}>
                Beat procrastination, avoid perfectionism
              </p>
            </div>
            
            <button
              onClick={startSession}
              className="w-full py-6 px-8 rounded-2xl text-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ backgroundColor: styles.accent, color: 'white' }}
            >
              <Play size={28} />
              Start Work Session
            </button>
            
            <div className="text-sm opacity-60 space-y-2" style={{ color: styles.color }}>
              <p>• 15-min activation phase to get started</p>
              <p>• Unlimited focus time with gentle check-ins</p>
              <p>• Quick reflection to build awareness</p>
            </div>
          </div>
        )}

        {/* Activation Phase */}
        {phase === 'activation' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: styles.color }}>
                Activation Zone
              </h2>
              <p className="text-lg opacity-80" style={{ color: styles.color }}>
                Just get moving - progress over perfection
              </p>
            </div>
            
            <div className="text-8xl font-mono font-bold" style={{ color: styles.color }}>
              {formatTime(activationTime)}
            </div>
            
            <div className="text-lg opacity-70" style={{ color: styles.color }}>
              Start anything. The goal is motion, not perfection.
            </div>
            
            <button
              onClick={stopSession}
              className="w-full py-4 px-6 rounded-xl text-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: styles.color }}
            >
              <Square size={20} />
              Stop Session
            </button>
          </div>
        )}

        {/* Focus Phase */}
        {phase === 'focus' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: styles.color }}>
                Deep Focus Mode
              </h2>
              <p className="text-lg opacity-80" style={{ color: styles.color }}>
                You're in the zone. Stay present.
              </p>
            </div>
            
            <div className="text-8xl font-mono font-bold" style={{ color: styles.color }}>
              {formatTime(focusTime)}
            </div>
            
            <div className="text-lg opacity-70" style={{ color: styles.color }}>
              Keep momentum going. You've got this.
            </div>
            
            <button
              onClick={stopSession}
              className="w-full py-4 px-6 rounded-xl text-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: styles.color }}
            >
              <Square size={20} />
              Stop Session
            </button>
          </div>
        )}

        {/* Reflection Phase */}
        {phase === 'reflection' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: styles.color }}>
              Session Reflection
            </h2>
            
            <div className="space-y-6 text-left">
              {/* Question 1 */}
              <div>
                <p className="text-lg mb-3 flex items-center gap-2" style={{ color: styles.color }}>
                  <CheckCircle size={20} />
                  Did you start something meaningful?
                </p>
                <div className="flex gap-3">
                  {['Yes', 'No'].map(option => (
                    <button
                      key={option}
                      onClick={() => setReflection({...reflection, meaningful: option})}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                        reflection.meaningful === option 
                          ? 'opacity-100 shadow-md' 
                          : 'opacity-60 hover:opacity-80'
                      }`}
                      style={{ 
                        backgroundColor: reflection.meaningful === option ? styles.accent : 'rgba(255,255,255,0.2)',
                        color: styles.color 
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <p className="text-lg mb-3 flex items-center gap-2" style={{ color: styles.color }}>
                  <AlertCircle size={20} />
                  Did you get stuck perfecting details?
                </p>
                <div className="flex gap-3">
                  {['Yes', 'No', 'Unsure'].map(option => (
                    <button
                      key={option}
                      onClick={() => setReflection({...reflection, perfectionism: option})}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        reflection.perfectionism === option 
                          ? 'opacity-100 shadow-md' 
                          : 'opacity-60 hover:opacity-80'
                      }`}
                      style={{ 
                        backgroundColor: reflection.perfectionism === option ? styles.accent : 'rgba(255,255,255,0.2)',
                        color: styles.color 
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <p className="text-lg mb-3" style={{ color: styles.color }}>
                  📝 What's next? (optional)
                </p>
                <textarea
                  value={reflection.nextTask}
                  onChange={(e) => setReflection({...reflection, nextTask: e.target.value})}
                  placeholder="Jot down your next action or thought..."
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border-none outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            <button
              onClick={finishReflection}
              disabled={!reflection.meaningful || !reflection.perfectionism}
              className="w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: reflection.meaningful && reflection.perfectionism ? styles.accent : 'rgba(255,255,255,0.3)',
                color: styles.color 
              }}
            >
              Complete Session
            </button>
          </div>
        )}

        {/* 10-minute prompt overlay */}
        {showPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto text-center shadow-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Quick Check-in
              </h3>
              <p className="text-gray-600 mb-6">
                Are you refining or avoiding?<br/>
                Still focused on what matters?
              </p>
              <button
                onClick={dismissPrompt}
                className="w-full py-3 px-6 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Back to Focus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ADHDTimerApp;