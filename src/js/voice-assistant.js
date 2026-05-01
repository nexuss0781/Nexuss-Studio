/**
 * Voice Assistant Module
 * Advanced speech-to-text and text-to-speech capabilities
 * Part of Infinite Free Ready PHP/JS Studio
 */

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        this.init();
    }

    init() {
        if (this.supported) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const results = event.results;
                const transcript = Array.from(results)
                    .map(result => result[0].transcript)
                    .join('');
                
                if (results[results.length - 1].isFinal) {
                    this.onFinalTranscript(transcript);
                } else {
                    this.onInterimTranscript(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }
    }

    startListening() {
        if (!this.supported) {
            console.warn('Speech recognition not supported');
            return false;
        }

        if (!this.isListening) {
            this.recognition.start();
            this.isListening = true;
        }
        return true;
    }

    stopListening() {
        if (this.isListening && this.recognition) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    toggleListening() {
        return this.isListening ? this.stopListening() : this.startListening();
    }

    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return false;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        utterance.lang = options.lang || 'en-US';

        // Select voice if specified
        if (options.voice) {
            const voices = this.synthesis.getVoices();
            const selectedVoice = voices.find(v => v.name === options.voice);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
        };

        utterance.onend = () => {
            this.isSpeaking = false;
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
        };

        this.synthesis.speak(utterance);
        return true;
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }

    getVoices() {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }

    onFinalTranscript(transcript) {
        // Override this method to handle final transcript
        console.log('Final transcript:', transcript);
    }

    onInterimTranscript(transcript) {
        // Override this method to handle interim transcript
        console.log('Interim transcript:', transcript);
    }

    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceAssistant;
}
