export default {
  title: 'Programmer Fortune Calendar',
  loading: "Calculating today's luck...",
  goodTitle: 'Do',
  badTitle: 'Avoid',
  seatDirectionLabel: 'Seat direction:',
  seatDirectionText: 'Face {direction} while coding for fewer bugs.',
  drinkLabel: 'Drink of the day:',
  goddessLabel: 'Crush affinity:',
  todayText: 'Today is {week}, {month}/{day}/{year}',
  drinkSeparator: ', ',
  weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  directions: [
    'North',
    'Northeast',
    'East',
    'Southeast',
    'South',
    'Southwest',
    'West',
    'Northwest'
  ],
  activities: [
    {
      name: 'Write unit tests',
      good: 'Unit tests will reduce mistakes',
      bad: 'Unit tests will slow down your development pace'
    },
    {
      name: 'Take a shower',
      good: "It has been a few days, hasn't it?",
      bad: 'You may wash away your design inspiration',
      weekend: true
    },
    {
      name: 'Work out',
      good: 'Time to stretch those stiff muscles',
      bad: 'You will burn little energy and eat even more',
      weekend: true
    },
    {
      name: 'Smoke',
      good: 'It might wake you up and sharpen your mind, though smoking is still harmful',
      bad: 'Smoking is bad for your health',
      weekend: true
    },
    {
      name: 'Deploy in daylight',
      good: 'A daytime release is safe today',
      bad: 'It may lead to catastrophic consequences'
    },
    {
      name: 'Refactor',
      good: 'Code quality will improve',
      bad: 'You may get stuck in a swamp of regressions'
    },
    {
      name: 'Use %t',
      good: 'You will look more tasteful',
      bad: 'People may think you are showing off'
    },
    {
      name: 'Change jobs',
      good: 'Let go when it is time to let go',
      bad: 'In this economy, your next job may not be any better'
    },
    {
      name: 'Hire someone',
      good: 'This person may have real potential',
      bad: 'Can this person even code?'
    },
    {
      name: 'Interview',
      good: 'The interviewer is in a good mood today',
      bad: 'The interviewer is annoyed and may vent on you'
    },
    {
      name: 'Submit your resignation',
      good: 'The company has found someone cheaper and more capable, and wants you gone fast',
      bad: 'In this economy, your next job may not be any better'
    },
    {
      name: 'Ask for a raise',
      good: 'The boss is in a good mood today',
      bad: 'The company is considering layoffs'
    },
    {
      name: 'Work overtime tonight',
      good: 'Night is when programmers are most alert',
      bad: 'You are exhausted already, get some rest',
      weekend: true
    },
    {
      name: 'Brag in front of your crush',
      good: 'It improves your image a little',
      bad: 'You will be seen through immediately',
      weekend: true
    },
    {
      name: 'Pull cards on Wikimoe',
      good: 'You are likely to get the card you want',
      bad: 'Trash cards will rain from the sky',
      weekend: true
    },
    {
      name: 'Write a tech post',
      good: 'A new masterpiece of content farming is about to be born',
      bad: 'Your post may get copied',
      weekend: true
    },
    {
      name: 'Name a variable "%v"',
      good: 'The variable name looks unexpectedly cute',
      bad: 'You will never reference this variable again'
    },
    {
      name: 'Write a method over %l lines',
      good: 'Your code is organized well enough to survive the length',
      bad: 'The code will become a mess you can no longer understand'
    },
    {
      name: 'Commit code',
      good: 'The chance of merge conflicts is at its lowest',
      bad: 'A mountain of conflicts will make you doubt the timeline'
    },
    {
      name: 'Review code',
      good: 'You are much more likely to spot important problems',
      bad: 'You will find nothing and waste the whole session'
    },
    {
      name: 'Attend a meeting',
      good: 'A quick nap away from coding is good for your health',
      bad: 'You may end up taking the blame'
    },
    {
      name: 'Play Overwatch',
      good: 'You will feel blessed by the gods',
      bad: 'You will get destroyed',
      weekend: true
    },
    {
      name: 'Deploy at night',
      good: 'Night is when programmers are most alert',
      bad: 'You have already burned through your energy in the daytime'
    },
    {
      name: 'Fix bugs',
      good: 'Your nose for bugs is unusually sharp today',
      bad: 'You will create more bugs than you fix'
    },
    {
      name: 'Design review',
      good: 'The review will turn into a real brainstorming session',
      bad: 'Everyone will be exhausted and nothing meaningful will happen'
    },
    {
      name: 'Requirement review',
      good: 'This requirement looks easy',
      bad: 'The company wants an app skin that changes with phone cases'
    },
    {
      name: 'Read blogs',
      good: "Today's stories are worth catching",
      bad: 'The blogosphere is full of negative energy today',
      weekend: true
    },
    {
      name: 'Browse anime sites',
      good: 'Do you really need a reason?',
      bad: 'The comments section is all keyboard warriors',
      weekend: true
    },
    {
      name: 'Play MapleStory Online',
      good: 'You may roll a god-tier 25-star setup',
      bad: 'Unless you want to smash your computer',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: 'Stay with your partner',
      description: "Valentine's Day punishes singles and rewards couples."
    }
  ],
  tools: [
    'Code in Eclipse',
    'Write docs in MS Office',
    'Code in Notepad',
    'Windows 8',
    'Linux',
    'macOS',
    'Internet Explorer',
    'Android device',
    'iOS device'
  ],
  varNames: [
    'result',
    'event',
    'payment',
    'expire',
    'bill',
    'each',
    'free',
    'i1',
    'a',
    'virtual',
    'ad',
    'spider',
    'password',
    'pass',
    'ui'
  ],
  drinks: [
    'Water',
    'Tea',
    'Black tea',
    'Green tea',
    'Coffee',
    'Milk tea',
    'Cola',
    'Fresh milk',
    'Soy milk',
    'Juice',
    'Fruit soda',
    'Soda water',
    'Sports drink',
    'Yogurt',
    'Alcohol'
  ]
}
