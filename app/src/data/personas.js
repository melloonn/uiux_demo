export const PERSONAS = {
  yichen: {
    id: 'yichen',
    name: 'Yichen Wang',
    archetype: 'Explorer',
    age: 25,
    location: 'Taipei, Taiwan',
    quote: { en: "If I don't find something interesting quickly, I just move on.", zh: '如果我沒有很快找到有趣的事情，我就繼續走。' },
    // Explorer prefers: visuals-first, fast discovery, spontaneous, nearby
    preferredView: 'reels',
    interests: ['live', 'festival', 'market'],
    maxPlanningDays: 0, // spontaneous
  },
  emma: {
    id: 'emma',
    name: 'Emma Weber',
    archetype: 'Planner',
    age: 22,
    location: 'Berlin, Germany',
    quote: { en: "I want to see all the activities clearly and quickly understand if they fit my schedule.", zh: '我希望清楚地看到所有活動，並快速了解它們是否符合我的行程。' },
    // Planner prefers: structured list, filters, calendar, all details
    preferredView: 'home',
    interests: ['festival', 'exhibition', 'market'],
    maxPlanningDays: 30,
  },
};
