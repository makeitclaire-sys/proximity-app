export type Person = {
  id: number
  name: string
  age: number
  status: string
  distance: string
  bio: string
  interests: string[]
  starters: string[]
}

export const mockPeople: Person[] = [
  {
    id: 1,
    name: 'Maya R.',
    age: 28,
    status: 'New in town',
    distance: 'in this room',
    bio: 'Designer turned founder. Moved here two months ago and still figuring out the best coffee spots. Into hiking, film photography, and long dinner parties.',
    interests: ['Design', 'Photography', 'Hiking', 'Food'],
    starters: [
      "What's your favourite coffee place around here?",
      "What's the last thing you built or made?"
    ],
  },
  {
    id: 2,
    name: 'Daniel K.',
    age: 34,
    status: 'Founder, seed-stage',
    distance: 'in this venue',
    bio: "Building a logistics startup. Previously at Stripe. I like talking to people who think about systems — software, cities, supply chains, doesn't matter.",
    interests: ['Startups', 'Logistics', 'Fintech', 'Cities'],
    starters: [
       "What's the problem you're most obsessed with solving?",
        "What did Stripe teach you that surprised you?" 
    ],
  },
  {
    id: 3,
    name: 'Priya S.',
    age: 26,
    status: 'PhD candidate',
    distance: '12m away',
    bio: 'Researching HCI at the intersection of AI and memory. Also into bouldering, terrible puns, and cooking ambitious meals for very small groups.',
    interests: ['HCI', 'AI research', 'Bouldering', 'Cooking'],
    starters: [
      'What aspect of AI are you most curious about right now?',
      "What's the hardest unsolved problem in your research?"
    ],
  },
  {
    id: 10,
    name: 'Jordan M.',
    age: 29,
    status: 'UX lead at Figma',
    distance: 'in this venue',
    bio: 'Designing systems that feel obvious in hindsight. Obsessed with craft, motion, and the gap between what users say and what they actually do.',
    interests: ['Design', 'UX', 'Motion', 'Music'],
    starters: [
      "What's a design detail you noticed recently that most people would miss?",
      "What's the most counterintuitive thing you've learned from user research?"
    ],
  },
  {
    id: 14,
    name: 'Chris L.',
    age: 33,
    status: 'Software engineer',
    distance: 'in this room',
    bio: 'Backend engineer with a soft spot for distributed systems and good espresso. Currently building infra at a Series B startup. Weekends are for cycling and cooking.',
    interests: ['Engineering', 'Distributed systems', 'Cycling', 'Coffee'],
    starters: [
      "What's the gnarliest production incident you've had to debug?",
      "What engineering trade-off do you find yourself making most often?"
    ],
  },
]
