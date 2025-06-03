import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.scss';
import { requestAskQuestion, requestClearChat } from '../Config/request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import DOMPurify from 'dompurify';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi là trợ lý bán hàng. Tôi có thể giúp gì cho bạn?', sender: 'bot' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => {
        // Try to get session ID from localStorage or generate a new one
        const savedSessionId = localStorage.getItem('chatSessionId');
        return savedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    });
    const messagesEndRef = useRef(null);

    // Save session ID to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('chatSessionId', sessionId);
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Sanitize HTML to prevent XSS attacks
    const sanitizeHTML = (html) => {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
            ALLOWED_ATTR: ['style', 'href', 'target']
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputMessage.trim() && !isLoading) {
            const userMessage = inputMessage.trim();
            setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
            setInputMessage('');
            setIsLoading(true);

            try {
                const response = await requestAskQuestion({ 
                    question: userMessage,
                    sessionId: sessionId
                });
                // Sanitize the HTML response
                const sanitizedResponse = sanitizeHTML(response);
                setMessages((prev) => [...prev, { text: sanitizedResponse, sender: 'bot' }]);
            } catch (error) {
                console.error('Chatbot error:', error);
                setMessages((prev) => [
                    ...prev,
                    {
                        text: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.',
                        sender: 'bot',
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const clearConversation = async () => {
        try {
            await requestClearChat({ sessionId });
            setMessages([
                { text: 'Xin chào! Tôi là trợ lý bán hàng. Tôi có thể giúp gì cho bạn?', sender: 'bot' },
            ]);
        } catch (error) {
            console.error('Error clearing conversation:', error);
        }
    };

    return (
        <>
            <button className={styles.chatButton} onClick={() => setIsOpen(true)} aria-label="Mở chat">
                <FontAwesomeIcon icon={faComments} />
            </button>

            {isOpen && (
                <div className={styles.chatbotContainer}>
                    <div className={styles.chatHeader}>
                        <h2>Hỗ trợ người dùng</h2>
                        <div className={styles.headerButtons}>
                            <button 
                                className={styles.clearButton} 
                                onClick={clearConversation} 
                                aria-label="Xóa cuộc trò chuyện"
                                title="Xóa cuộc trò chuyện"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <button 
                                className={styles.closeButton} 
                                onClick={() => setIsOpen(false)} 
                                aria-label="Đóng chat"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.messageList}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${
                                    message.sender === 'user' ? styles.userMessage : styles.botMessage
                                }`}
                            >
                                <div 
                                    className={styles.messageContent}
                                    dangerouslySetInnerHTML={{ __html: message.text }}
                                />
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <div className={styles.messageContent}>
                                    <div className={styles.loadingContainer}>
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Nhập tin nhắn của bạn..."
                            className={styles.input}
                            disabled={isLoading}
                        />
                        <button type="submit" className={styles.sendButton} disabled={isLoading}>
                            Gửi
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
