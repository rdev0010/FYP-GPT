import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({onPromptClick}) => {
    const prompts = [
        "What are people saying about a specific country?",
        "What are people saying about specific climate-related issues?",
        "What are some of the solutions proposed by people to address these issues?",
        "How do the innovators describe the urgency of addressing climate change?",
        "How do people propose to raise awareness about climate issues?"
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => 
            <PromptSuggestionButton 
                key={`suggestion-${index}`}
                text={prompt}
                onClick={() => onPromptClick(prompt)}
            />)}
        </div>
    )
}

export default PromptSuggestionsRow