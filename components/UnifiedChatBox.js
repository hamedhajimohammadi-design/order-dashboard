"use client";
import { useState, useEffect, useRef } from 'react';

export default function UnifiedChatBox({ userId, telegramId, isOnline: initialOnline, lastActive }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeSession, setActiveSession] = useState(null);
    const messagesEndRef = useRef(null);
    const [localIsOnline, setLocalIsOnline] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 5000); 
            return () => clearInterval(interval);
        }
    }, [userId]);

    useEffect(() => {
        const checkOnline = () => {
            if (!lastActive) return false;
            const diff = (new Date() - new Date(lastActive)) / 1000 / 60; 
            return diff < 5;
        };
        setLocalIsOnline(checkOnline());
        const interval = setInterval(() => setLocalIsOnline(checkOnline()), 60000);
        return () => clearInterval(interval);
    }, [lastActive]);

    const fetchHistory = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/chat/history?userId=${userId}`);
            const data = await res.json();
            if (data.sessions && data.sessions.length > 0) {
                let allMsgs = [];
                let bestSession = null;
                
                data.sessions.forEach(session => {
                    const sessionMsgs = session.messages.map(m => ({
                        ...m,
                        platform: session.platform,
                        sessionId: session.id
                    }));
                    allMsgs = [...allMsgs, ...sessionMsgs];
                    
                    if (!bestSession || new Date(session.last_message_at) > new Date(bestSession.last_message_at)) {
                        bestSession = session;
                    }
                });

                allMsgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                setMessages(allMsgs);
                if (bestSession) setActiveSession(bestSession);
            }
        } catch (e) {
            console.error("Chat Load Error", e);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        let payload = { content: newMessage };
        
        if (activeSession) {
            payload.sessionId = activeSession.id;
        } else if (telegramId) {
            payload.userId = userId;
            payload.platform = 'telegram';
        } else {
            alert("No chat channel available.");
            return;
        }

        const tempMsg = { 
            id: Date.now(), 
            sender: 'admin', 
            content: newMessage, 
            created_at: new Date().toISOString(), 
            platform: activeSession?.platform || 'telegram'
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage("");

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                fetchHistory(); 
            } else {
                alert("Send failed");
            }
        } catch (e) {
            alert("Error sending");
        }
    };

    return (
        <div className="flex flex-col h-[400px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${localIsOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        {localIsOnline && <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>}
                    </div>
                    <span className="font-bold text-gray-700 text-sm">پیام‌رسان</span>
                    {activeSession ? (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSession.platform === 'telegram' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {activeSession.platform === 'telegram' ? 'تلگرام' : 'گفتینو'}
                        </span>
                    ) : (
                        telegramId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">شروع جدید (تلگرام)</span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                        <p>هنوز پیامی نیست.</p>
                     </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isAdmin = msg.sender === 'admin' || msg.sender === 'system';
                        return (
                            <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                                    isAdmin 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 shadow-sm border rounded-bl-none'
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                    <div className={`text-[10px] mt-1 text-right gap-1 ${isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t bg-white">
                <div className="flex gap-2">
                    <input 
                        className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={activeSession || telegramId ? "پیام..." : "غیرفعال"}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!activeSession && !telegramId}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!activeSession && !telegramId}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:bg-gray-300"
                    >
                        <span>Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
