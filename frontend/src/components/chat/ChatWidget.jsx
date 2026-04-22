import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader } from 'lucide-react';
import { getResponse, getWelcomeMessage, getTypingDelay, formatMechanicsResponse, formatBookingsResponse } from './chatbotEngine';
import { getPublicMechanics } from '../../services/mechanicService';
import { getCustomerBookings } from '../../services/bookingService';
import styles from '../../styles/ChatWidget.module.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Welcome message on first open
    useEffect(() => {
        if (isOpen && !hasOpenedBefore) {
            setHasOpenedBefore(true);
            const welcome = getWelcomeMessage();
            setIsTyping(true);
            setTimeout(() => {
                setMessages([{
                    id: Date.now(),
                    sender: 'bot',
                    text: welcome.text,
                    quickReplies: welcome.quickReplies,
                    time: new Date()
                }]);
                setIsTyping(false);
            }, 600);
        }
    }, [isOpen, hasOpenedBefore]);

    /**
     * Fetch dynamic data from APIs and return formatted response
     */
    const handleDynamicIntent = async (dynamicType) => {
        try {
            if (dynamicType === 'mechanics') {
                const mechanics = await getPublicMechanics(true);
                return formatMechanicsResponse(mechanics);
            }
            if (dynamicType === 'bookings') {
                const bookings = await getCustomerBookings();
                return formatBookingsResponse(bookings);
            }
        } catch (error) {
            console.error('Chatbot API error:', error);
            if (dynamicType === 'mechanics') {
                return {
                    text: "⚠️ I couldn't fetch the mechanic list right now. Please try the **Find Mechanics** page from the sidebar, or try again in a moment.",
                    quickReplies: ['Book a Service', 'How Payment Works', 'Contact Support']
                };
            }
            if (dynamicType === 'bookings') {
                return {
                    text: "⚠️ I couldn't fetch your bookings right now. Please try the **My Bookings** page from the sidebar, or try again in a moment.",
                    quickReplies: ['Book a Service', 'How Payment Works', 'Contact Support']
                };
            }
        }
        return null;
    };

    const handleSend = async (text) => {
        const messageText = text || inputValue.trim();
        if (!messageText || isTyping) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: messageText,
            time: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Show typing indicator
        setIsTyping(true);

        // Get engine response
        const response = getResponse(messageText);
        const delay = getTypingDelay();

        if (response.dynamic && response.dynamicType) {
            // Add interim "fetching..." message after short delay
            setTimeout(async () => {
                // Fetch real data from API
                const dynamicResponse = await handleDynamicIntent(response.dynamicType);
                const finalResponse = dynamicResponse || response;

                const botMsg = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: finalResponse.text,
                    quickReplies: finalResponse.quickReplies,
                    time: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, delay);
        } else {
            // Static response
            setTimeout(() => {
                const botMsg = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: response.text,
                    quickReplies: response.quickReplies,
                    time: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, delay);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Simple markdown-ish rendering for bold and line breaks
    const renderText = (text) => {
        const parts = text.split(/(\*\*.*?\*\*|\n)/g);
        return parts.map((part, i) => {
            if (part === '\n') return <br key={i} />;
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className={styles.highlight}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className={styles.chatContainer}>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.chatWindow}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {/* Header */}
                        <div className={styles.chatHeader}>
                            <div className={styles.headerLeft}>
                                <div className={styles.botIcon}>
                                    <Bot size={18} />
                                </div>
                                <div className={styles.headerInfo}>
                                    <h3>VEHICLE ASSISTANT</h3>
                                    <div className={styles.statusIndicator}>
                                        <span className={styles.statusDot}></span>
                                        <span className={styles.statusText}>ONLINE</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={styles.closeButton}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className={styles.messagesArea}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    className={`${styles.messageRow} ${msg.sender === 'user' ? styles.messageRowUser : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className={styles.avatarSmall}>
                                            <Bot size={14} />
                                        </div>
                                    )}
                                    <div className={styles.messageContent}>
                                        <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot
                                            }`}>
                                            <p>{renderText(msg.text)}</p>
                                        </div>
                                        <span className={`${styles.messageTime} ${msg.sender === 'user' ? styles.messageTimeUser : ''}`}>
                                            {formatTime(msg.time)}
                                        </span>
                                        {/* Quick Replies — only on last bot message */}
                                        {msg.sender === 'bot' && index === messages.length - 1 && msg.quickReplies && msg.quickReplies.length > 0 && !isTyping && (
                                            <div className={styles.quickReplies}>
                                                {msg.quickReplies.map((reply, i) => (
                                                    <motion.button
                                                        key={i}
                                                        className={styles.quickReplyBtn}
                                                        onClick={() => handleSend(reply)}
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.08 }}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                    >
                                                        {reply}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    className={styles.messageRow}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className={styles.avatarSmall}>
                                        <Bot size={14} />
                                    </div>
                                    <div className={`${styles.messageBubble} ${styles.messageBubbleBot} ${styles.typingBubble}`}>
                                        <div className={styles.typingDots}>
                                            <span className={styles.typingDot}></span>
                                            <span className={styles.typingDot}></span>
                                            <span className={styles.typingDot}></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className={styles.inputArea}>
                            <div className={styles.inputWrapper}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type your question..."
                                    className={styles.chatInput}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    disabled={isTyping}
                                />
                                <button
                                    className={styles.sendButton}
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isTyping}
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.toggleButton} ${isOpen ? styles.toggleButtonOpen : ''}`}
                whileHover={{ scale: isOpen ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {!isOpen && <div className={styles.pingEffect}></div>}
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <MessageSquare size={24} />
                        <div className={styles.notificationDot}></div>
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
