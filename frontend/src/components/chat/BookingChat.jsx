import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, User, Wrench } from 'lucide-react';
import { getBookingMessages, sendBookingMessage } from '../../services/bookingService';
import styles from '../../styles/BookingChat.module.css';

const BookingChat = ({ isOpen, onClose, bookingId, otherPartyName, currentUserRole }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!bookingId) return;
        try {
            const data = await getBookingMessages(bookingId);
            setMessages(data.messages || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setLoading(false);
        }
    }, [bookingId]);

    // Fetch messages on open and start polling
    useEffect(() => {
        if (isOpen && bookingId) {
            setLoading(true);
            fetchMessages();

            // Poll every 5 seconds for new messages
            pollIntervalRef.current = setInterval(fetchMessages, 5000);

            return () => {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                }
            };
        } else {
            setMessages([]);
            setLoading(true);
        }
    }, [isOpen, bookingId, fetchMessages]);

    // Scroll to bottom when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = async () => {
        const text = newMessage.trim();
        if (!text || sending) return;

        setSending(true);
        setNewMessage('');
        try {
            const data = await sendBookingMessage(bookingId, text);
            if (data.message) {
                setMessages(prev => [...prev, data.message]);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setNewMessage(text); // Restore on failure
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short'
        });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.created_at);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.drawer}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <div className={styles.headerAvatar}>
                                {currentUserRole === 'CUSTOMER' ? <Wrench size={18} /> : <User size={18} />}
                            </div>
                            <div>
                                <h3 className={styles.headerName}>{otherPartyName || 'Chat'}</h3>
                                <span className={styles.headerSubtext}>Booking #{bookingId}</span>
                            </div>
                        </div>
                        <motion.button
                            className={styles.closeBtn}
                            onClick={onClose}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    {/* Messages Area */}
                    <div className={styles.messagesArea}>
                        {loading ? (
                            <div className={styles.loadingState}>
                                <MessageCircle size={32} />
                                <p>Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className={styles.emptyState}>
                                <MessageCircle size={40} />
                                <h4>No messages yet</h4>
                                <p>Send a message to start the conversation</p>
                            </div>
                        ) : (
                            Object.entries(groupedMessages).map(([date, msgs]) => (
                                <div key={date}>
                                    <div className={styles.dateDivider}>
                                        <span>{date}</span>
                                    </div>
                                    {msgs.map((msg) => {
                                        const isSent = msg.sender_role === currentUserRole;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                className={`${styles.messageBubble} ${isSent ? styles.sent : styles.received}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {!isSent && (
                                                    <span className={styles.senderLabel}>{msg.sender_name}</span>
                                                )}
                                                <p className={styles.messageText}>{msg.message}</p>
                                                <span className={styles.messageTime}>
                                                    {formatTime(msg.created_at)}
                                                    {isSent && msg.is_read && (
                                                        <span className={styles.readIndicator}>✓✓</span>
                                                    )}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={styles.inputArea}>
                        <input
                            ref={inputRef}
                            type="text"
                            className={styles.messageInput}
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={sending}
                        />
                        <motion.button
                            className={styles.sendBtn}
                            onClick={handleSend}
                            disabled={!newMessage.trim() || sending}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send size={18} />
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BookingChat;
