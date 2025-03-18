// Aura System Configuration
const AURA_CONFIG = {
    maxInitialScore: 750,
    baseQuestions: [
        "How would you approach a girl you find attractive?",
        "What do you do when you walk into a room full of people?",
        "How do you respond when another man disrespects you?",
        "What's your go-to conversation starter with a stranger?",
        "How do you react when someone challenges your beliefs?",
        "What do you do when you feel out of place in a social setting?",
        "How do you carry yourself when walking down the street?"
    ],
    dailyCheckInQuestions: [
        "Did you work on your physical fitness today?",
        "Did you take on a challenge or push past your comfort zone?",
        "Did you engage with new people or strengthen key relationships?"
    ]
};

class AuraSystem {
    constructor() {
        this.baseScore = 0;
        this.currentScore = 0;
        this.hasInitialScore = false;
        this.askedQuestions = [];
        this.lastCheckIn = null;
        this.currentQuestionIndex = 0;
        this.responses = [];
        this.pendingQuestion = null;
    }

    analyzeResponse(response) {
        const analysis = {
            confidence: 0,
            composure: 0,
            awareness: 0,
            leadership: 0,
            authenticity: 0,
            strengths: [],
            areas_for_growth: []
        };

        // Analyze confidence
        const confidenceMarkers = ['confident', 'self-assurance', 'strong', 'firm', 'decisive'];
        confidenceMarkers.forEach(marker => {
            if (response.toLowerCase().includes(marker)) {
                analysis.confidence++;
                analysis.strengths.push('confidence');
            }
        });

        // Analyze composure
        const composureMarkers = ['calm', 'composed', 'relaxed', 'steady', 'controlled'];
        composureMarkers.forEach(marker => {
            if (response.toLowerCase().includes(marker)) {
                analysis.composure++;
                analysis.strengths.push('emotional intelligence');
            }
        });

        // Analyze social awareness
        const awarenessMarkers = ['aware', 'reading', 'context', 'attentive', 'mindful'];
        awarenessMarkers.forEach(marker => {
            if (response.toLowerCase().includes(marker)) {
                analysis.awareness++;
                analysis.strengths.push('social awareness');
            }
        });

        // Analyze authenticity
        const authenticityMarkers = ['genuine', 'authentic', 'natural', 'real', 'true'];
        authenticityMarkers.forEach(marker => {
            if (response.toLowerCase().includes(marker)) {
                analysis.authenticity++;
                analysis.strengths.push('authenticity');
            }
        });

        // Analyze leadership
        const leadershipMarkers = ['lead', 'guide', 'purposeful', 'initiative', 'presence'];
        leadershipMarkers.forEach(marker => {
            if (response.toLowerCase().includes(marker)) {
                analysis.leadership++;
                analysis.strengths.push('leadership presence');
            }
        });

        return analysis;
    }

    generateAnalysis(response, questionContext) {
        const analysis = this.analyzeResponse(response);
        let feedback = "I've analyzed your response, and there are several interesting elements to unpack:\n\n";

        // Add context-specific analysis
        if (questionContext.includes('attractive') || questionContext.includes('girl')) {
            feedback += "Your approach to attraction and social interaction reveals key aspects of your masculine presence. ";
            if (response.includes('context') || response.includes('reading')) {
                feedback += "I particularly appreciate your emphasis on reading social context first - this shows advanced emotional intelligence and social calibration. ";
            }
            if (response.includes('genuine') || response.includes('authentic')) {
                feedback += "Your focus on authentic connection rather than superficial attraction demonstrates mature masculine energy. ";
            }
        }

        // Add strengths analysis
        const uniqueStrengths = [...new Set(analysis.strengths)];
        if (uniqueStrengths.length > 0) {
            feedback += "\n\nKey Strengths:\n";
            uniqueStrengths.forEach(strength => {
                switch(strength) {
                    case 'confidence':
                        feedback += "- Natural Confidence: You project self-assurance without arrogance\n";
                        break;
                    case 'emotional intelligence':
                        feedback += "- Emotional Intelligence: You maintain composure while staying genuine\n";
                        break;
                    case 'social awareness':
                        feedback += "- Social Calibration: You demonstrate strong situational awareness\n";
                        break;
                    case 'authenticity':
                        feedback += "- Authentic Presence: You prioritize genuine connection over performance\n";
                        break;
                    case 'leadership presence':
                        feedback += "- Leadership Energy: You naturally take initiative while remaining respectful\n";
                        break;
                }
            });
        }

        // Add balanced perspective
        feedback += "\nWhat's particularly effective is how you balance ";
        if (analysis.confidence > 0 && analysis.awareness > 0) {
            feedback += "confidence with social awareness";
        } else if (analysis.confidence > 0 && analysis.composure > 0) {
            feedback += "strength with composure";
        } else if (analysis.authenticity > 0) {
            feedback += "authenticity with presence";
        }
        feedback += ". This creates a more complete and mature masculine energy.\n";

        // Add growth-oriented feedback
        if (analysis.confidence < 2 || analysis.awareness < 2 || analysis.composure < 2) {
            feedback += "\nAreas for Potential Growth:\n";
            if (analysis.confidence < 2) feedback += "- Consider developing even stronger self-expression while maintaining your authenticity\n";
            if (analysis.awareness < 2) feedback += "- You might benefit from deepening your social calibration skills\n";
            if (analysis.composure < 2) feedback += "- There's opportunity to strengthen your emotional mastery\n";
        }

        return feedback;
    }

    evaluateResponse(response) {
        // Store the response
        this.responses.push(response);
        
        // Generate detailed analysis
        const currentQuestion = this.askedQuestions[this.currentQuestionIndex];
        const analysis = this.generateAnalysis(response, currentQuestion);

        this.currentQuestionIndex++;

        // If we've collected all responses, calculate final score
        if (this.currentQuestionIndex >= 3) {
            const scoreResult = this.calculateInitialScore();
            return {
                type: 'final_analysis',
                score: scoreResult.score,
                message: scoreResult.message,
                analysis: analysis
            };
        }

        // Get next question
        const nextQuestion = this.getNextQuestion();
        return {
            type: 'analysis',
            message: analysis,
            nextQuestion: nextQuestion
        };
    }

    getNextQuestion() {
        if (this.currentQuestionIndex >= 3) {
            return this.calculateInitialScore();
        }

        const unusedQuestions = AURA_CONFIG.baseQuestions.filter(q => !this.askedQuestions.includes(q));
        const question = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
        this.askedQuestions.push(question);
        return question;
    }

    calculateInitialScore() {
        let totalScore = 0;
        let overallAnalysis = "Let me provide a comprehensive analysis of your responses.\n\n";

        this.responses.forEach((response, index) => {
            const analysis = this.analyzeResponse(response);
            totalScore += (analysis.confidence + analysis.composure + analysis.awareness + analysis.leadership + analysis.authenticity) * 100;
            
            if (analysis.strengths.length > 0) {
                const uniqueStrengths = [...new Set(analysis.strengths)];
                overallAnalysis += `In scenario ${index + 1}, you demonstrated exceptional ${uniqueStrengths.join(', ')}. `;
            }
        });

        this.baseScore = Math.min(Math.floor(totalScore / this.responses.length), AURA_CONFIG.maxInitialScore);
        this.hasInitialScore = true;

        return {
            type: 'score',
            score: this.baseScore,
            message: this.getScoreMessage(this.baseScore, overallAnalysis)
        };
    }

    getScoreMessage(score, analysis) {
        let message = analysis + "\n\n";
        
        if (score >= 700) {
            message += `Your Aura Score of ${score} reflects exceptional masculine presence. Your responses consistently demonstrate a sophisticated balance of strength and awareness. You show remarkable ability to maintain authentic power while remaining socially calibrated - a rare combination that naturally commands respect.\n\nTo further elevate your presence, consider exploring:`;
        } else if (score >= 500) {
            message += `Your Aura Score of ${score} indicates solid masculine presence with clear potential for growth. Your responses show good instincts and natural leadership qualities, balanced with social awareness. There's opportunity to further develop these strong foundations.\n\nTo strengthen your presence, consider focusing on:`;
        } else {
            message += `Your Aura Score of ${score} marks the beginning of your journey toward stronger masculine presence. Your responses show potential, particularly in authenticity. Remember, mastery begins with self-awareness - you're already on the right path.\n\nLet's start by focusing on:`;
        }

        message += "\n1. Self-Mastery: Internal strength and personal discipline"
                + "\n2. Leadership: Developing natural authority and presence"
                + "\n3. Relationships: Building meaningful connections with strength and authenticity"
                + "\n\nWhich area would you like to explore first?";

        return message;
    }
}

// Initialize Aura System
const auraSystem = new AuraSystem();

// Response Generation System
function getResponse(input) {
    // Initial aura assessment phase
    if (!auraSystem.hasInitialScore) {
        const response = auraSystem.evaluateResponse(input);
        return response;
    }

    // Topic-based responses
    input = input.toLowerCase();
    
    if (input.includes('self') || input.includes('discipline') || input.includes('mastery')) {
        return {
            type: 'response',
            message: "Your interest in self-mastery shows wisdom. This is the foundation of true masculine strength. Let's explore how you can develop unshakeable inner confidence and discipline. What specific aspect of self-mastery interests you most: mental resilience, emotional control, or habit formation?"
        };
    }
    
    if (input.includes('lead') || input.includes('confidence')) {
        return {
            type: 'response',
            message: "Leadership and natural authority come from authentic self-expression combined with genuine concern for others. Your interest in this area shows ambition and vision. Would you like to explore developing commanding presence, strategic thinking, or team dynamics?"
        };
    }
    
    if (input.includes('relationship') || input.includes('connection')) {
        return {
            type: 'response',
            message: "Building strong relationships while maintaining your masculine frame is an art. It requires balancing strength with empathy, and boundaries with openness. What specific aspect of relationship mastery would you like to explore: attraction, maintaining frame, or building lasting connections?"
        };
    }

    return {
        type: 'response',
        message: "Your journey of masculine development is unique to you. Each area we explore - Self-Mastery, Leadership, and Relationships - builds upon the others. Which aspect resonates most with your current goals?"
    };
}