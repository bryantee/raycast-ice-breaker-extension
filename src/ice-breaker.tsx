import {
  Action,
  ActionPanel,
  AI,
  Clipboard,
  Detail,
  Icon,
  Image,
  Keyboard,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import React, { useEffect, useState } from "react";

type QuestionStyle = {
  name: string;
  description: string;
  icon: Image.ImageLike;
};

const questionStyles: QuestionStyle[] = [
  {
    name: "Introspective",
    description: "Deep, reflective questions about personal experiences and values",
    icon: "🤔",
  },
  { name: "Light-hearted", description: "Fun, casual questions to create a relaxed atmosphere", icon: "😌" },
  {
    name: "Thought-provoking",
    description: "Questions that spark interesting discussions and new perspectives",
    icon: "🧠",
  },
  { name: "Funny", description: "Humorous questions to bring laughter and energy to the team", icon: "🍆" },
];
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
      `
      Generate a ${selectedQuestionStyle.toLowerCase()} ice-breaker question for a team meeting. The question should:

- Help the team let loose and shake off any cobwebs before diving into the meeting
- Help teammates get to know each other better on a personal level
- Encourage sharing and connection
- Be engaging and easy to answer
- Avoid being cheesy, we're here to be chill
- Don't make the team 🤦
- Take 1-2 minutes to answer per person
${selectedQuestionStyle === "Funny" ? "- Be humorous but respectful" : ""}
${selectedQuestionStyle === "Introspective" ? "- Encourage reflection on personal experiences, values, or growth" : ""}
${selectedQuestionStyle === "Light-hearted" ? "- Be fun and casual to create a relaxed atmosphere" : ""}
${selectedQuestionStyle === "Thought-provoking" ? "- Spark interesting discussions and new perspectives" : ""}

Please provide just the question without any additional explanation or context.`,
      { creativity: creativityLevel }
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
      title={style.name}
      key={style.name}
      icon={style.icon}
      subtitle={style.description}
      actions={
        <ActionPanel>
          <Action title="Ask" onAction={() => setSelectedQuestionStyle(style.name)} />
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
      navigationTitle="Ice Breaker Question"
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Generate New" onAction={askQuestion} />
          <Action title="Start over" onAction={clear} />
          <Action title="More Creative" onAction={increaseCreativityLevel} shortcut={Keyboard.Shortcut.Common.MoveUp} />
          <Action title="Less Creative" onAction={lowerCreativityLevel} shortcut={Keyboard.Shortcut.Common.MoveDown} />
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
