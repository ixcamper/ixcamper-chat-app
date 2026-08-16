// src/app/page.tsx - PART 1 (Theme Toggle Setup)
"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';

interface ChatMessage {
	from: string;
	to: string;
	text: string;
	timestamp: string;
}

type ServerPayload =
	| { type: 'user_list'; users: string[] }
	| { type: 'msg'; from: string; to: string; text: string; timestamp: string };

export default function Home() {
	const [username, setUsername] = useState<string>('');
	const [isRegistered, setIsRegistered] = useState<boolean>(false);
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
	const [inputMessage, setInputMessage] = useState<string>('');

	// Theme Switching State Tracking Logic ('light' or 'dark')
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	const [unreadUsers, setUnreadUsers] = useState<Set<string>>(new Set());
	const [isWindowFocused, setIsWindowFocused] = useState<boolean>(true);
	const [hasUnreadTabAlert, setHasUnreadTabAlert] = useState<boolean>(false);
	const [mounted, setMounted] = useState<boolean>(false);

	const socketRef = useRef<WebSocket | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setMounted(true);
		setUsername(`User_${Math.floor(Math.random() * 1000)}`);
	}, []);

	// PART 2 (Theme Toggle Hook Logic)
	useEffect(() => {
		if (!mounted) return;
		const handleFocus = () => { setIsWindowFocused(true); setHasUnreadTabAlert(false); };
		const handleBlur = () => { setIsWindowFocused(false); };
		window.addEventListener('focus', handleFocus);
		window.addEventListener('blur', handleBlur);
		return () => { window.removeEventListener('focus', handleFocus); window.removeEventListener('blur', handleBlur); };
	}, [mounted]);

	useEffect(() => {
		if (!mounted) return;
		let intervalId: any;
		if (hasUnreadTabAlert) {
			let showAlternate = false;
			intervalId = window.setInterval(() => {
				document.title = showAlternate ? "💬 New Message!" : "Private Chat Engine";
				showAlternate = !showAlternate;
			}, 1000);
		} else { document.title = "Private Chat Engine"; }
		return () => { if (intervalId) window.clearInterval(intervalId); };
	}, [hasUnreadTabAlert, mounted]);

	const handleRegisterSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!username.trim()) return;
		socketRef.current = new WebSocket('ws://localhost:5001');
		socketRef.current.onopen = () => {
			socketRef.current?.send(JSON.stringify({ type: 'register', username: username.trim() }));
			setIsRegistered(true);
		};
		socketRef.current.onmessage = (event: MessageEvent) => {
			try {
				const data: ServerPayload = JSON.parse(event.data);
				if (data.type === 'user_list') { setOnlineUsers(data.users.filter(u => u !== username)); }
				else if (data.type === 'msg') {
					const chatPartner = data.from === username ? data.to : data.from;
					if (data.from !== username && (!isWindowFocused || selectedUser !== data.from)) {
						setHasUnreadTabAlert(true);
						setUnreadUsers((prev) => new Set([...prev, data.from]));
					}
					setChatHistories((prev) => ({
						...prev, [chatPartner]: [...(prev[chatPartner] || []), { from: data.from, to: data.to, text: data.text, timestamp: data.timestamp }]
					}));
				}
			} catch (err) { console.error(err); }
		};
		socketRef.current.onclose = () => { setIsRegistered(false); setSelectedUser(null); };
	};

	useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistories, selectedUser]);

	const sendPrivateMessage = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (!inputMessage.trim() || !selectedUser || !socketRef.current) return;
		const payload = { type: 'private_message', from: username, to: selectedUser, text: inputMessage.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
		if (socketRef.current.readyState === WebSocket.OPEN) { socketRef.current.send(JSON.stringify(payload)); setInputMessage(''); }
	};

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	if (!mounted) return null;

	// PART 3 (Theme Toggle Dynamic Layout Rendering)
	if (!isRegistered) {
		const loginBg = theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-br from-slate-900 to-indigo-950';
		const formClass = theme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-white/10 backdrop-blur-md text-white border-white/20';
		const inputClass = theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900/50 border-slate-700/60 text-white placeholder-slate-500';

		return (
			<main className={`min-h-screen flex items-center justify-center p-4 relative ${loginBg}`}>
				{/* Floating Theme Button during Login phase */}
				<button onClick={toggleTheme} type="button" className={`absolute top-4 right-4 px-4 py-2 text-xs font-bold rounded-xl border shadow-sm transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
					{theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
				</button>

				<form onSubmit={handleRegisterSubmit} className={`w-full max-w-md p-8 rounded-2xl shadow-xl border ${formClass}`}>
					<div className="flex flex-col items-center mb-6">
						<span className={`text-4xl p-3 rounded-full mb-3 border ${theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-indigo-600/30 border-indigo-500/50'}`}>💬</span>
						<h2 className={`text-2xl font-bold tracking-tight text-center ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Join Chat Engine</h2>
						<p className={`text-sm mt-1 text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Pick a handle to connect instantly to nearby users.</p>
					</div>
					<div className="flex flex-col gap-4">
						<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={`rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${inputClass}`} placeholder="Username..." required />
						<button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-md transition-all">Launch Network</button>
					</div>
				</form>
			</main>
		);
	}

	const activeConversation = selectedUser ? chatHistories[selectedUser] || [] : [];

	return (
		<main className={`min-h-screen flex items-center justify-center sm:p-4 transition-colors ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'}`}>
			<div className={`w-full max-w-6xl shadow-xl flex h-screen sm:h-[750px] overflow-hidden border transition-colors ${theme === 'light' ? 'bg-white border-slate-200 sm:rounded-2xl' : 'bg-slate-900 border-slate-800 sm:rounded-2xl'}`}>

				{/* Roster Sidebar Menu Layout */}
				<div className={`w-80 flex flex-col border-r transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'}`}>
					<div className={`p-4 border-b flex items-center justify-between transition-colors ${theme === 'light' ? 'border-slate-200 bg-slate-100/50' : 'border-slate-800 bg-slate-950'}`}>
						<div className="truncate">
							<span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Active Profile</span>
							<h3 className={`text-sm font-bold truncate ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>👤 {username}</h3>
						</div>
						{/* Context theme toggle interface switch trigger */}
						<button onClick={toggleTheme} className={`p-2 text-xs rounded-lg border transition-all ${theme === 'light' ? 'bg-white hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'}`}>
							{theme === 'light' ? '🌙' : '☀️'}
						</button>
					</div>
					<div className="flex-1 overflow-y-auto p-3 space-y-1">
						<div className="px-2 my-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Channels</span></div>
						{onlineUsers.length === 0 ? (
							<p className="text-xs text-slate-400 italic p-3 text-center">Waiting for users...</p>
						) : (
							onlineUsers.map((user) => {
								const isSelected = selectedUser === user;
								let activeBtnStyle = isSelected ? 'bg-blue-600 text-white' : theme === 'light' ? 'text-slate-600 hover:bg-slate-200/80' : 'text-slate-400 hover:bg-slate-900';
								return (
									<button key={user} onClick={() => { setSelectedUser(user); setUnreadUsers((p) => { const n = new Set(p); n.delete(user); return n; }); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium transition-all ${activeBtnStyle}`}>
										<span>🎯 {user}</span>
										{unreadUsers.has(user) && selectedUser !== user && <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>}
									</button>
								);
							})
						)}
					</div>
				</div>

				{/* Messaging Area Terminal Content */}
				<div className={`flex-1 flex flex-col transition-colors ${theme === 'light' ? 'bg-slate-50/50' : 'bg-slate-900'}`}>
					{selectedUser ? (
						<>
							<div className={`p-4 border-b font-bold px-6 shadow-sm transition-colors ${theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}>
								Chatting with: <span className="text-blue-600">{selectedUser}</span>
							</div>
							<div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
								{activeConversation.map((msg, i) => {
									const isMe = msg.from === username;
									let bubbleStyle = isMe ? 'bg-blue-600 text-white self-end rounded-tr-none' : theme === 'light' ? 'bg-white text-slate-800 border border-slate-200 self-start rounded-tl-none' : 'bg-slate-950 text-slate-300 border border-slate-800 self-start rounded-tl-none';
									return (
										<div key={i} className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm font-medium ${bubbleStyle}`}>
											<p>{msg.text}</p>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>
							<form onSubmit={sendPrivateMessage} className={`p-4 border-t flex gap-3 px-6 transition-colors ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950'}`}>
								<input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Type a message..." className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-all font-medium ${theme === 'light' ? 'border-slate-200 bg-slate-50 focus:bg-white text-slate-800' : 'border-slate-800 bg-slate-900 focus:bg-slate-950 text-white'}`} />
								<button type="submit" className="bg-blue-600 hover:bg-blue-500 transition-all text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md">Send</button>
							</form>
						</>
					) : (
						<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
							<span className={`text-4xl mb-3 p-3 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-950 border-slate-800'}`}>✉️</span>
							<h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>No Active Chat</h3>
							<p className="text-xs text-slate-400 mt-1 max-w-xs">Select an online profile handle directory path from your roster view layout to connect.</p>
						</div>
					)}
				</div>

			</div>
		</main>
	);
}

