// app/components/ChatbotWrapper.jsx
"use client";

import { usePathname } from 'next/navigation';
import Chatbot from './Chatbot';

export default function ChatbotWrapper() {
    const pathname = usePathname();
    
    // Páginas onde o chatbot NÃO deve aparecer
    const hideChatbotPages = [
        '/login',
        '/registro', 
        '/register',
        '/signin', 
        '/signup',
        '/auth',
        '/' 
    ];
    
    const shouldShowChatbot = !hideChatbotPages.some(page => 
        pathname === page
    );
    
    console.log('📱 Pathname:', pathname, 'Show Chatbot:', shouldShowChatbot);
    
    if (!shouldShowChatbot) {
        return null;
    }
    
    return <Chatbot />;
}