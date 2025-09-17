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
    name: "Personal Stories",
    description: "Questions that invite sharing meaningful life experiences and memories",
    icon: "📖",
  },
  {
    name: "Creative Hypotheticals",
    description: "Imaginative 'what if' scenarios that reveal personality and values",
    icon: "🎭",
  },
  {
    name: "Quirky Preferences",
    description: "Unexpected choices that show unique perspectives and spark conversations",
    icon: "🎲",
  },
  {
    name: "Professional Growth",
    description: "Work-related insights that help teammates understand each other's journey",
    icon: "🌱",
  },
  {
    name: "Pop Culture & Trends",
    description: "Current events, shows, and cultural moments that connect generations",
    icon: "📺",
  },
  {
    name: "Nostalgic Moments",
    description: "Childhood memories and past experiences that bring warmth and relatability",
    icon: "🕰️",
  },
  {
    name: "Future Visioning",
    description: "Dreams, goals, and aspirations that inspire and motivate the team",
    icon: "🚀",
  },
  {
    name: "Skills & Talents",
    description: "Hidden abilities and interesting hobbies that teammates might not know about",
    icon: "🎯",
  },
  {
    name: "Travel & Places",
    description: "Geography, cultures, and adventures that broaden perspectives",
    icon: "🌍",
  },
  {
    name: "Seasonal & Timely",
    description: "Questions tied to current season, holidays, or recent events",
    icon: "🗓️",
  },
];
const defaultCreativityLevel: AI.Creativity = "high";
const creativityLevelContinuum: AI.Creativity[] = ["low", "medium", "high", "maximum"];

const getSeason = (date: Date): string => {
  const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Fall";
  return "Winter";
};

const getPromptForStyle = (style: string, currentMonth: string, currentSeason: string): string => {
  const basePrompt = `Generate a unique ice-breaker question for a team meeting that:

🎯 CORE GOALS:
- Helps teammates discover something new about each other
- Creates genuine moments of connection and understanding
- Takes 1-2 minutes per person to answer thoughtfully
- Feels natural and conversational, not forced or corporate
- Sparks interesting follow-up conversations

🚫 AVOID:
- Generic questions everyone's heard before
- Overly personal or uncomfortable topics
- Questions with obvious or boring answers
- Corporate jargon or "team building" clichés
- Questions that feel like interview prompts

📅 CONTEXT: It's ${currentMonth} (${currentSeason}), so consider seasonal relevance when appropriate.

`;

  switch (style) {
    case "Personal Stories":
      return basePrompt + `🎨 STYLE: Personal Stories
Create a question that invites sharing a meaningful memory, experience, or moment that shaped who they are. Focus on stories that reveal character, values, or interesting life experiences. Examples of good directions:
- Moments of unexpected learning or growth
- Times when they surprised themselves
- Experiences that changed their perspective
- Memorable encounters with strangers
- Childhood moments that still influence them today`;
    
    case "Creative Hypotheticals":
      return basePrompt + `🎨 STYLE: Creative Hypotheticals
Develop an imaginative "what if" scenario that reveals personality, values, or decision-making style. Make it specific and interesting, not generic. Good approaches:
- Unique superpowers with interesting constraints
- Time travel scenarios with specific purposes
- Resource allocation in unusual situations
- Creative problem-solving in fantastical contexts
- Moral dilemmas in interesting settings`;
    
    case "Quirky Preferences":
      return basePrompt + `🎨 STYLE: Quirky Preferences
Ask about unexpected choices, preferences, or opinions that reveal personality and spark interesting discussions. Focus on:
- Unusual combinations or mashups
- Preferences between interesting alternatives
- Personal rules or systems they've developed
- Unique ways they approach common situations
- Surprising likes/dislikes with interesting reasoning`;
    
    case "Professional Growth":
      return basePrompt + `🎨 STYLE: Professional Growth
Explore work-related insights that help teammates understand each other's journey and perspective. Keep it personal and growth-focused:
- Skills they're secretly proud of developing
- Unexpected lessons from past roles or projects
- Career pivots or surprising paths they've taken
- Mentorship moments (giving or receiving)
- Work habits or approaches that others might find interesting`;
    
    case "Pop Culture & Trends":
      return basePrompt + `🎨 STYLE: Pop Culture & Trends
Connect through current culture, entertainment, and trends in ways that reveal personality and create connections:
- Recent discoveries in entertainment, music, or content
- Generational differences in pop culture preferences
- Guilty pleasures or unexpected favorites
- How they consume or interact with media
- Cultural moments that resonated with them recently`;
    
    case "Nostalgic Moments":
      return basePrompt + `🎨 STYLE: Nostalgic Moments
Invite sharing of past experiences that bring warmth and help teammates see each other's background:
- Childhood traditions or family quirks
- School memories that still make them smile
- Old technology or trends they remember fondly
- Places from their past that hold special meaning
- Generational markers that shaped their worldview`;
    
    case "Future Visioning":
      return basePrompt + `🎨 STYLE: Future Visioning
Explore dreams, aspirations, and forward-thinking that inspires and motivates:
- Personal projects or goals they're excited about
- Skills they want to develop or experiences they want to have
- How they imagine their future self
- Changes they want to see in their field or the world
- Adventures or challenges on their bucket list`;
    
    case "Skills & Talents":
      return basePrompt + `🎨 STYLE: Skills & Talents
Uncover hidden abilities, interesting hobbies, or unique knowledge that teammates might not know about:
- Unexpected skills they've picked up
- Hobbies or interests outside their professional identity
- Things they're surprisingly good at
- Unique knowledge areas or expertise
- Creative outlets or side projects`;
    
    case "Travel & Places":
      return basePrompt + `🎨 STYLE: Travel & Places
Explore connections to geography, cultures, and places that broaden perspectives:
- Places that left a lasting impression on them
- Cultural differences they've observed or experienced
- Local spots or hidden gems they know about
- Dream destinations and the reasons behind them
- How different places have influenced their worldview`;
    
    case "Seasonal & Timely":
      return basePrompt + `🎨 STYLE: Seasonal & Timely
Create questions tied to the current time of year, recent events, or seasonal experiences:
- ${currentSeason}-specific activities or memories
- Recent events or trends that caught their attention
- Seasonal traditions or rituals they enjoy
- How the current time of year affects their mood or energy
- ${currentMonth} memories or associations that stand out`;
    
    default:
      return basePrompt + `Create an engaging ice-breaker question that helps teammates connect.`;
  }
};

export default function Command() {
  const [creativityLevel, setCreativityLevel] = useState<AI.Creativity>(defaultCreativityLevel);
  const [question, setQuestion] = useState("");
  const [selectedQuestionStyle, setSelectedQuestionStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = () => {
    setIsLoading(true);

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentSeason = getSeason(currentDate);

    AI.ask(
      getPromptForStyle(selectedQuestionStyle, currentMonth, currentSeason) + `\n\nProvide ONLY the question itself, nothing else.`,
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
