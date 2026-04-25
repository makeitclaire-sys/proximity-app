export type Person = {
  id: string
  name: string
  age: number
  bio: string
  interests: string[]
  talkTopics: string[]
  avoidTopics: string[]
  mode?: "social" | "professional"
  isVisible?: boolean
  avatarUrl?: string
  // fields present in mock data but not required from Supabase
  status?: string
  distance?: string
  starters?: string[]
}

export const mockPeople: Person[] = [
  {
    id: "1",
    name: "Maya R.",
    age: 28,
    status: "New in town",
    distance: "in this room",
    bio: "Designer turned founder. Moved here two months ago and still figuring out the best coffee spots. Into hiking, film photography, and long dinner parties.",
    interests: ["Design", "Photography", "Hiking", "Food"],
    starters: [
      "What's your favourite coffee place around here?",
      "What's the last thing you built or made?"
    ],
    talkTopics: [
      "Starting over in a new city",
      "Film photography and why it makes you slow down",
      "The design decisions nobody ever notices"
    ],
    avoidTopics: [
      "Hustle culture and 5am routines",
      "NFTs",
      "Growth hacking"
    ],
  },
  {
    id: "2",
    name: "Daniel K.",
    age: 34,
    status: "Founder, seed-stage",
    distance: "in this venue",
    bio: "Building a logistics startup. Previously at Stripe. I like talking to people who think about systems — software, cities, supply chains, doesn't matter.",
    interests: ["Startups", "Logistics", "Fintech", "Cities"],
    starters: [
      "What's the problem you're most obsessed with solving?",
      "What did Stripe teach you that surprised you?"
    ],
    talkTopics: [
      "How cities actually move goods around",
      "What early-stage company building really feels like",
      "Infrastructure that most people take for granted"
    ],
    avoidTopics: [
      "Web3 as the answer to everything",
      "Pivoting as a strategy",
      "Productivity porn"
    ],
  },
  {
    id: "3",
    name: "Priya S.",
    age: 26,
    status: "PhD candidate",
    distance: "12m away",
    bio: "Researching HCI at the intersection of AI and memory. Also into bouldering, terrible puns, and cooking ambitious meals for very small groups.",
    interests: ["HCI", "AI research", "Bouldering", "Cooking"],
    starters: [
      "What aspect of AI are you most curious about right now?",
      "What's the hardest unsolved problem in your research?"
    ],
    talkTopics: [
      "How technology is reshaping human memory",
      "What user research actually reveals about people",
      "Bouldering problems that took embarrassingly long"
    ],
    avoidTopics: [
      "AI is going to take all our jobs",
      "Why academia is a waste of time",
      "Optimal morning routines"
    ],
  },
  {
    id: "10",
    name: "Jordan M.",
    age: 29,
    status: "UX lead at Figma",
    distance: "in this venue",
    bio: "Designing systems that feel obvious in hindsight. Obsessed with craft, motion, and the gap between what users say and what they actually do.",
    interests: ["Design", "UX", "Motion", "Music"],
    starters: [
      "What's a design detail you noticed recently that most people would miss?",
      "What's the most counterintuitive thing you've learned from user research?"
    ],
    talkTopics: [
      "Design systems that actually scale",
      "The craft behind good motion design",
      "What Figma still gets wrong"
    ],
    avoidTopics: [
      "Design thinking as a buzzword",
      "Dark patterns and conversion tricks",
      "Who 'owns' design at a company"
    ],
  },
  {
    id: "14",
    name: "Chris L.",
    age: 33,
    status: "Software engineer",
    distance: "in this room",
    bio: "Backend engineer with a soft spot for distributed systems and good espresso. Currently building infra at a Series B startup. Weekends are for cycling and cooking.",
    interests: ["Engineering", "Distributed systems", "Cycling", "Coffee"],
    starters: [
      "What's the gnarliest production incident you've had to debug?",
      "What engineering trade-off do you find yourself making most often?"
    ],
    talkTopics: [
      "Distributed systems failure modes and war stories",
      "Espresso as a technical pursuit",
      "Long bike routes that are actually fun"
    ],
    avoidTopics: [
      "Blockchain for everything",
      "The 10x engineer myth",
      "Rewriting it in Rust just because"
    ],
  },
]
