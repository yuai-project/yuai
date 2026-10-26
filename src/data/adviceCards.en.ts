// 結果画面のアドバイスの英語版（#217）。日本語は adviceCards.ts。
//
// - 形は日本語と同じ（項目の数・順番も同じ。テストで確かめる）。出典（sources）は日本語側にだけ置く
// - 日本語より意味を足したり強めたりしない。日英の対訳表は #217 の PR
// - CLAUDE.md の7原則を英語にも当てはめる（断定しない・"conspiracy theorist" などのラベルを貼らない・
//   変えられると約束しない・無理に話さなくていい逃げ道を残す）
// - 相手との関係（father / mother など）は誰が選んでも合うように、文章に入れない（they / them を使う）

import type { AdviceCardText, CardKey, ForYouCard, SafetyContent, SectionKey } from './types.ts'

export const SECTION_TITLES_EN: Record<SectionKey, string> = {
  avoid: 'Responses you might want to avoid',
  tryReplies: 'Replies you could try',
  askNext: 'Questions you could ask next',
}

export const FOR_YOU_EN: { default: ForYouCard } & Partial<Record<CardKey, ForYouCard>> = {
  default: {
    title: 'First, for you',
    body: "You don't have to carry the responsibility of changing their mind on your own. When it is hard to keep talking, stepping back a little is also an important choice. First, please take a moment to appreciate yourself for facing this so far.",
    keyPoint: "You don't have to carry the responsibility of changing their mind on your own.",
  },
  exhausted: {
    title: 'First, for you',
    body: 'Having faced this so far is a big thing in itself. If you are feeling tired, it is okay to put your own rest first. Spending less time talking does not mean giving up on the relationship.',
    keyPoint: 'It is okay to put your own rest first.',
  },
  distance: {
    title: 'First, for you',
    body: "Wanting some distance is a natural feeling. Keeping distance to protect yourself is not the same as abandoning them. You don't have to force yourself to keep things the way they were.",
    keyPoint: 'Keeping distance to protect yourself is not the same as abandoning them.',
  },
}

export const ADVICE_CARDS_EN: Record<CardKey, AdviceCardText> = {
  default: {
    avoid: {
      items: [
        "That's just a hoax.",
        "You're just being fooled.",
        "It's strange to believe something like that.",
      ],
      reason:
        "Flatly dismissing what they say may leave them feeling “you don't understand me,” so they become defensive and the conversation can become harder to continue.",
    },
    tryReplies: {
      items: [
        'It sounds like something is worrying you enough to feel that way.',
        'How did you first come across that?',
        'What part of it concerns you the most?',
        "If you're okay with it, could we look at where the information came from together?",
      ],
    },
    askNext: {
      items: [
        'How did you feel when you learned about it?',
        'What feels most worrying to you?',
        'Is there anything I can do?',
      ],
    },
  },

  angry: {
    avoid: {
      items: ["That's just a hoax.", "You're just being fooled.", 'Enough already.'],
      reason:
        'When their view is rejected, they may feel that they themselves, not just their ideas, are being rejected, and become defensive.',
    },
    tryReplies: {
      items: [
        'Can I ask what made you start thinking that way?',
        "So that's what worries you most.",
        'I see it a little differently, but I want to understand how you feel.',
        'Could we leave this topic here for today?',
      ],
    },
    askNext: {
      items: [
        'What part of it bothers you the most?',
        'How did you feel when you found out about it?',
        'Is there anything I can do?',
      ],
    },
  },

  exhausted: {
    avoid: {
      items: ["I don't care anymore.", 'How many times do I have to tell you?'],
      reason:
        'When you are tired, harsh words can come out more easily, and you may blame yourself afterward. It is okay to take a little time before you talk.',
    },
    tryReplies: {
      items: [
        "I'm a bit tired today, so tell me another time.",
        'Could we keep that topic short?',
        "Sorry, I might not be able to listen well right now. Let's talk again when things are calmer.",
        "I'll listen, but is it okay if we don't settle anything today?",
      ],
    },
    askNext: {
      items: [
        'How have you been feeling lately?',
        'Apart from this, has anything good happened lately?',
        'Could we talk again another time, without rushing?',
      ],
    },
  },

  distance: {
    avoid: {
      items: ["I'm never talking to you again.", "I'm worn out because of you."],
      reason:
        "Ending things with harsh words may make it harder to reconnect later if you want to. If you need to step away for your safety, you don't have to worry about choosing your words.",
    },
    tryReplies: {
      title: 'Things you could say when stepping back',
      items: [
        "Let's take a break from this topic for a while.",
        'You matter to me. I just need a little time.',
        "It's not that I've come to dislike you.",
        "When I feel ready to talk again, I'll reach out to you.",
      ],
    },
  },
}

export const SAFETY_EN: SafetyContent = {
  title: "In situations like these, you don't have to force yourself to talk",
  signs: [
    'Being yelled at or verbally abused',
    'Feeling threatened',
    'Feeling emotionally overwhelmed',
    'Serious effects on your daily life or work',
  ],
  body: 'Your own safety and mental health come first. Rather than carrying this alone, please also consider turning to someone you trust, or to public support services and professional organizations.',
}
