import { Action, ActionPanel, AI, Clipboard, Detail, Icon, List, showToast, Toast } from "@raycast/api";
import React, { useEffect, useState } from "react";

const questionStyles = ["Introspective", "Light-hearted", "Thought-provoking", "Funny"];
const defaultCreativityLevel: AI.Creativity = "high";
const creativityLevelContinuum: AI.Creativity[] = ["low", "medium", "high", "maximum"];

export default function Command() {
  const [creativityLevel, setCreativityLevel] = useState<AI.Creativity>(defaultCreativityLevel);
  const [question, setQuestion] = useState("");
  const [selectedQuestionStyle, setSelectedQuestionStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = () => {
    setIsLoading(true);

    AI.ask(
      `Give me a(n) random ${selectedQuestionStyle} icebreaker question that I can ask my teammates in a meeting to better know them? The question should not be a joke.`,
      { creativity: creativityLevel },
    )
      .then(async (q) => {
        setQuestion(q);
        setIsLoading(false);

        await Promise.all([
          Clipboard.copy(q),
          showToast(Toast.Style.Success, "Generated!", "The question has been copied to your clipboard."),
        ]);
      })
      .catch(async (e) => {
        setIsLoading(false);
        await showToast(Toast.Style.Failure, "Failed to generate question", e.message);
      });
  };

  useEffect(() => {
    if (selectedQuestionStyle === "") {
      return;
    }

    askQuestion();
  }, [selectedQuestionStyle]);

  const clearQuestion = () => {
    setQuestion("");
    setIsLoading(false);
  };

  const clearQuestionStyle = () => {
    setSelectedQuestionStyle("");
    setIsLoading(false);
  };

  const clear = () => {
    clearQuestion();
    clearQuestionStyle();
  };

  const list = questionStyles.map((style) => (
    <List.Item
      title={style}
      key={style}
      actions={
        <ActionPanel>
          <Action title="Ask" onAction={() => setSelectedQuestionStyle(style)} />
        </ActionPanel>
      }
    />
  ));

  if (!selectedQuestionStyle) {
    return (
      <>
        <List navigationTitle="Choose a question style..." isLoading={isLoading}>
          {list}
        </List>
      </>
    );
  }

  const markdown = `
    # A ${selectedQuestionStyle} Question:
    
    ${question}
  `.trim();

  const lowerCreativityLevel = () => {
    const index = creativityLevelContinuum.indexOf(creativityLevel);
    const nextCreativityLevel = creativityLevelContinuum[index - 1];

    if (nextCreativityLevel) {
      setCreativityLevel(nextCreativityLevel);
    }
  };

  const increaseCreativityLevel = () => {
    const index = creativityLevelContinuum.indexOf(creativityLevel);
    const nextCreativityLevel = creativityLevelContinuum[index + 1];

    if (nextCreativityLevel) {
      setCreativityLevel(nextCreativityLevel);
    }
  };

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Generate New" onAction={askQuestion} />
          <Action title="Start Over" onAction={clear} />
          <Action title="More Creative" onAction={increaseCreativityLevel} />
          <Action title="Less Creative" onAction={lowerCreativityLevel} />
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text={selectedQuestionStyle} color={"#eedc35"} icon={Icon.Dna} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.TagList title="Creativity">
            <Detail.Metadata.TagList.Item text={creativityLevel as string} color={"#82EE35FF"} icon={Icon.Brush} />
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}
