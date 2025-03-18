// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const clearButton = document.getElementById('clearChat');
const auraScoreDisplay = document.getElementById('auraScore');

// Chat State
let isTyping = false;
let isFirstQuestion = true;

// Utility Functions
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updateAuraScore(score) {
    const auraDisplay = document.getElementById('auraScore');
    auraDisplay.textContent = `Aura Score: ${score}`;
    auraDisplay.classList.remove('hidden');
    auraDisplay.classList.add('aura-pulse');
    
    setTimeout(() => {
        auraDisplay.classList.remove('aura-pulse');
    }, 2000);
}

function createMessageElement(content, isUser = false, includeAura = false, auraScore = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message ml-auto' : 'bot-message'} p-4 mb-4 text-white`;
    
    // Handle multi-paragraph responses
    if (typeof content === 'string') {
        const paragraphs = content.split('\n');
        paragraphs.forEach(paragraph => {
            if (paragraph.trim()) {
                const p = document.createElement('p');
                p.className = 'mb-2';
                p.textContent = paragraph.trim();
                messageDiv.appendChild(p);
            }
        });
    } else {
        const textDiv = document.createElement('div');
        textDiv.textContent = content;
        messageDiv.appendChild(textDiv);
    }
    
    // Add aura score if provided
    if (includeAura && auraScore !== null) {
        const auraDiv = document.createElement('div');
        auraDiv.className = 'mt-4 text-sm text-blue-300 font-semibold border-t border-blue-500 pt-2';
        auraDiv.textContent = `Aura Score: ${auraScore}`;
        messageDiv.appendChild(auraDiv);
        
        updateAuraScore(auraScore);
    }
    
    return messageDiv;
}

function createTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message p-4 mb-4';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    return typingDiv;
}

// Chat Functions
async function addMessage(content, isUser = false, includeAura = false, auraScore = null) {
    const messageElement = createMessageElement(content, isUser, includeAura, auraScore);
    chatContainer.appendChild(messageElement);
    scrollToBottom();
}

async function simulateTyping(duration = 1500) {
    if (isTyping) return;
    isTyping = true;

    const typingIndicator = createTypingIndicator();
    chatContainer.appendChild(typingIndicator);
    scrollToBottom();

    await new Promise(resolve => setTimeout(resolve, duration));

    chatContainer.removeChild(typingIndicator);
    isTyping = false;
}

async function processResponse(response, userMessage) {
    if (response.type === 'analysis') {
        // Add the analysis of the previous response
        await addMessage(response.message, false);
        
        // Add a small delay before showing the next question
        await simulateTyping(1000);
        
        // Show the next question
        await addMessage(response.nextQuestion, false);
    } else if (response.type === 'final_analysis') {
        // Add the analysis of the final response
        await addMessage(response.analysis, false);
        
        // Add a small delay before showing the final score and message
        await simulateTyping(1500);
        
        // Show the final score and comprehensive analysis
        await addMessage(response.message, false, true, response.score);
    } else if (response.type === 'response') {
        // Regular conversational response
        await addMessage(response.message, false);
    }
}

async function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Clear input and disable send button
    userInput.value = '';
    sendButton.disabled = true;
    sendButton.className = 'bg-blue-400 cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2';

    // Add user message
    await addMessage(message, true);

    // Show typing indicator and wait
    await simulateTyping();

    // Get and process AI response
    const response = getResponse(message);
    await processResponse(response, message);

    // Re-enable input
    userInput.focus();
}

// Event Listeners
sendButton.addEventListener('click', handleUserMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});

clearButton.addEventListener('click', () => {
    // Reset conversation but keep aura score if exists
    const currentScore = auraSystem.baseScore;
    
    // Keep only the welcome message
    while (chatContainer.children.length > 1) {
        chatContainer.removeChild(chatContainer.lastChild);
    }
    
    // Add welcome message based on aura state
    const welcomeMessage = auraSystem.hasInitialScore 
        ? `Welcome back! Your current Aura Score is ${currentScore}. I've been analyzing your responses and growth patterns. What aspect of masculine development would you like to explore today?`
        : "Welcome to AuraChat! I'm here to help you assess and develop your masculine presence through detailed analysis and personalized guidance. Let's start with a few questions to understand your current aura and potential areas for growth.";
    
    addMessage(welcomeMessage, false, auraSystem.hasInitialScore, currentScore);

    // If we're starting fresh, add the first question after a short delay
    if (!auraSystem.hasInitialScore) {
        setTimeout(async () => {
            await simulateTyping(1000);
            const firstQuestion = auraSystem.getNextQuestion();
            await addMessage(firstQuestion, false);
        }, 1000);
    }
});

// Enable/disable send button based on input
userInput.addEventListener('input', () => {
    const hasText = userInput.value.trim().length > 0;
    sendButton.disabled = !hasText;
    sendButton.className = hasText 
        ? 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2'
        : 'bg-blue-400 cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2';
});

// Add copy functionality to messages
chatContainer.addEventListener('click', (e) => {
    const message = e.target.closest('.message');
    if (!message) return;

    // Copy message text to clipboard
    navigator.clipboard.writeText(message.textContent).then(() => {
        // Show temporary tooltip or notification
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg';
        notification.textContent = 'Message copied to clipboard!';
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Focus input on page load
    userInput.focus();
    
    // Disable send button initially
    sendButton.disabled = true;
    sendButton.className = 'bg-blue-400 cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2';
    
    // Add initial welcome message
    await addMessage("Welcome to AuraChat! I'm here to help you assess and develop your masculine presence through detailed analysis and personalized guidance. Let's start with a few questions to understand your current aura and potential areas for growth.", false);
    
    // Add first question immediately after welcome message
    await simulateTyping(1000);
    const firstQuestion = auraSystem.getNextQuestion();
    await addMessage(firstQuestion, false);
});