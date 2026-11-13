import { snapshotSchema } from './domain.ts';
// Manually transcribed historical sample data; never imports or runs database seeds.
export const sample = snapshotSchema.parse({
  feedback: [
    {
      id: 'seed-01',
      title: 'Add tags for solutions',
      category: 'enhancement',
      baselineVotes: 112,
      status: 'suggestion',
      description: 'Easier to search for solutions based on a specific stack.',
      authorId: 'sample',
      order: 1,
    },
    {
      id: 'seed-02',
      title: 'Add a dark theme option',
      category: 'feature',
      baselineVotes: 99,
      status: 'suggestion',
      description:
        'It would help people with light sensitivities and who prefer dark mode.',
      authorId: 'sample',
      order: 2,
    },
    {
      id: 'seed-03',
      title: 'Q&A within the challenge hubs',
      category: 'feature',
      baselineVotes: 65,
      status: 'suggestion',
      description: 'Challenge-specific Q&A would make for easy reference.',
      authorId: 'sample',
      order: 3,
    },
    {
      id: 'seed-04',
      title: 'Add image/video upload to feedback',
      category: 'enhancement',
      baselineVotes: 51,
      status: 'suggestion',
      description: 'Images and screencasts can enhance comments on solutions.',
      authorId: 'sample',
      order: 4,
    },
    {
      id: 'seed-05',
      title: 'Ability to follow others',
      category: 'feature',
      baselineVotes: 42,
      status: 'suggestion',
      description: 'Stay updated on comments and solutions other people post.',
      authorId: 'sample',
      order: 5,
    },
    {
      id: 'seed-06',
      title: 'Preview images not loading',
      category: 'bug',
      baselineVotes: 3,
      status: 'suggestion',
      description:
        'Challenge preview images are missing when you apply a filter.',
      authorId: 'sample',
      order: 6,
    },
    {
      id: 'seed-07',
      title: 'More comprehensive reports',
      category: 'feature',
      baselineVotes: 123,
      status: 'planned',
      description:
        'It would be great to see a more detailed breakdown of solutions.',
      authorId: 'sample',
      order: 7,
    },
    {
      id: 'seed-08',
      title: 'Learning paths',
      category: 'feature',
      baselineVotes: 28,
      status: 'planned',
      description:
        'Sequenced projects for different goals to help people improve.',
      authorId: 'sample',
      order: 8,
    },
    {
      id: 'seed-09',
      title: 'One-click portfolio generation',
      category: 'feature',
      baselineVotes: 62,
      status: 'in-progress',
      description:
        'Add ability to create professional looking portfolio from profile.',
      authorId: 'sample',
      order: 9,
    },
    {
      id: 'seed-10',
      title: 'Bookmark challenges',
      category: 'feature',
      baselineVotes: 31,
      status: 'in-progress',
      description: 'Be able to bookmark challenges to take later on.',
      authorId: 'sample',
      order: 10,
    },
    {
      id: 'seed-11',
      title: 'Animated solution screenshots',
      category: 'bug',
      baselineVotes: 9,
      status: 'in-progress',
      description:
        'Screenshots of solutions with animations don’t display correctly.',
      authorId: 'sample',
      order: 11,
    },
    {
      id: 'seed-12',
      title: 'Add micro-interactions',
      category: 'enhancement',
      baselineVotes: 71,
      status: 'live',
      description: 'Small animations at specific points can add delight.',
      authorId: 'sample',
      order: 12,
    },
  ],
  comments: [
    {
      id: 'comment-01',
      feedbackId: 'seed-01',
      authorId: 'user-01',
      parentId: null,
      replyLabel: '',
      content:
        'Awesome idea! Trying to find framework-specific projects within the hubs can be tedious',
    },
    {
      id: 'comment-02',
      feedbackId: 'seed-01',
      authorId: 'user-02',
      parentId: null,
      replyLabel: '',
      content:
        'Please use fun, color-coded labels to easily identify them at a glance',
    },
    {
      id: 'comment-03',
      feedbackId: 'seed-02',
      authorId: 'user-03',
      parentId: null,
      replyLabel: '',
      content:
        'Also, please allow styles to be applied based on system preferences. I would love to be able to browse Frontend Mentor in the evening after my device’s dark mode turns on without the bright background it currently has.',
    },
    {
      id: 'comment-04',
      feedbackId: 'seed-02',
      authorId: 'user-04',
      parentId: null,
      replyLabel: '',
      content:
        'Second this! I do a lot of late night coding and reading. Adding a dark theme can be great for preventing eye strain and the headaches that result. It’s also quite a trend with modern apps and  apparently saves battery life.',
    },
    {
      id: 'comment-05',
      feedbackId: 'seed-02',
      authorId: 'user-05',
      parentId: 'comment-04',
      replyLabel: 'hummingbird1',
      content:
        "While waiting for dark mode, there are browser extensions that will also do the job. Search for 'dark theme' followed by your browser. There might be a need to turn off the extension for sites with naturally black backgrounds though.",
    },
    {
      id: 'comment-06',
      feedbackId: 'seed-02',
      authorId: 'user-06',
      parentId: 'comment-04',
      replyLabel: 'annev1990',
      content:
        "Good point! Using any kind of style extension is great and can be highly customizable, like the ability to change contrast and brightness. I'd prefer not to use one of such extensions, however, for security and privacy reasons.",
    },
    {
      id: 'comment-07',
      feedbackId: 'seed-03',
      authorId: 'user-07',
      parentId: null,
      replyLabel: '',
      content:
        "Much easier to get answers from devs who can relate, since they've either finished the challenge themselves or are in the middle of it.",
    },
    {
      id: 'comment-08',
      feedbackId: 'seed-04',
      authorId: 'user-08',
      parentId: null,
      replyLabel: '',
      content:
        "Right now, there is no ability to add images while giving feedback which isn't ideal because I have to use another app to show what I mean",
    },
    {
      id: 'comment-09',
      feedbackId: 'seed-04',
      authorId: 'user-09',
      parentId: null,
      replyLabel: '',
      content:
        "Yes I'd like to see this as well. Sometimes I want to add a short video or gif to explain the site's behavior..",
    },
    {
      id: 'comment-10',
      feedbackId: 'seed-05',
      authorId: 'user-09',
      parentId: null,
      replyLabel: '',
      content:
        'I also want to be notified when devs I follow submit projects on FEM. Is in-app notification also in the pipeline?',
    },
    {
      id: 'comment-11',
      feedbackId: 'seed-05',
      authorId: 'user-11',
      parentId: 'comment-10',
      replyLabel: 'arlen_the_marlin',
      content:
        "Bumping this. It would be good to have a tab with a feed of people I follow so it's easy to see what challenges they’ve done lately. I learn a lot by reading good developers' code.",
    },
    {
      id: 'comment-12',
      feedbackId: 'seed-05',
      authorId: 'user-12',
      parentId: null,
      replyLabel: '',
      content:
        "I've been saving the profile URLs of a few people and I check what they’ve been doing from time to time. Being able to follow them solves that",
    },
    {
      id: 'comment-13',
      feedbackId: 'seed-07',
      authorId: 'user-10',
      parentId: null,
      replyLabel: '',
      content:
        'This would be awesome! It would be so helpful to see an overview of my code in a way that makes it easy to spot where things could be improved.',
    },
    {
      id: 'comment-14',
      feedbackId: 'seed-07',
      authorId: 'user-12',
      parentId: null,
      replyLabel: '',
      content:
        "Yeah, this would be really good. I'd love to see deeper insights into my code!",
    },
    {
      id: 'comment-15',
      feedbackId: 'seed-08',
      authorId: 'user-07',
      parentId: null,
      replyLabel: '',
      content:
        "Having a path through the challenges that I could follow would be brilliant! Sometimes I'm not sure which challenge would be the best next step to take. So this would help me navigate through them!",
    },
    {
      id: 'comment-16',
      feedbackId: 'seed-09',
      authorId: 'user-06',
      parentId: null,
      replyLabel: '',
      content:
        "I haven't built a portfolio site yet, so this would be really helpful. Might it also be possible to choose layout and colour themes?!",
    },
    {
      id: 'comment-17',
      feedbackId: 'seed-10',
      authorId: 'user-01',
      parentId: null,
      replyLabel: '',
      content:
        "This would be great! At the moment, I'm just starting challenges in order to save them. But this means the My Challenges section is overflowing with projects and is hard to manage. Being able to bookmark challenges would be really helpful.",
    },
    {
      id: 'comment-18',
      feedbackId: 'seed-12',
      authorId: 'user-10',
      parentId: null,
      replyLabel: '',
      content:
        "I'd love to see this! It always makes me so happy to see little details like these on websites.",
    },
    {
      id: 'comment-19',
      feedbackId: 'seed-12',
      authorId: 'user-01',
      parentId: 'comment-18',
      replyLabel: 'arlen_the_marlin',
      content:
        "Me too! I'd also love to see celebrations at specific points as well. It would help people take a moment to celebrate their achievements!",
    },
  ],
  votedIds: [],
});
export const actors = [
  {
    id: 'demo',
    name: 'Demo participant',
    username: 'demo',
    avatar: null,
  },
  {
    id: 'sample',
    name: 'Sample feedback',
    username: 'sample',
    avatar: null,
  },
  {
    id: 'user-01',
    name: 'Suzanne Chang',
    username: 'upbeat1811',
    avatar: '/assets/user-images/image-suzanne.jpg',
  },
  {
    id: 'user-02',
    name: 'Thomas Hood',
    username: 'brawnybrave',
    avatar: '/assets/user-images/image-thomas.jpg',
  },
  {
    id: 'user-03',
    name: 'Elijah Moss',
    username: 'hexagon.bestagon',
    avatar: '/assets/user-images/image-elijah.jpg',
  },
  {
    id: 'user-04',
    name: 'James Skinner',
    username: 'hummingbird1',
    avatar: '/assets/user-images/image-james.jpg',
  },
  {
    id: 'user-05',
    name: 'Anne Valentine',
    username: 'annev1990',
    avatar: '/assets/user-images/image-anne.jpg',
  },
  {
    id: 'user-06',
    name: 'Ryan Welles',
    username: 'voyager.344',
    avatar: '/assets/user-images/image-ryan.jpg',
  },
  {
    id: 'user-07',
    name: 'George Partridge',
    username: 'soccerviewer8',
    avatar: '/assets/user-images/image-george.jpg',
  },
  {
    id: 'user-08',
    name: 'Javier Pollard',
    username: 'warlikeduke',
    avatar: '/assets/user-images/image-javier.jpg',
  },
  {
    id: 'user-09',
    name: 'Roxanne Travis',
    username: 'peppersprime32',
    avatar: '/assets/user-images/image-roxanne.jpg',
  },
  {
    id: 'user-10',
    name: 'Victoria Mejia',
    username: 'arlen_the_marlin',
    avatar: '/assets/user-images/image-victoria.jpg',
  },
  {
    id: 'user-11',
    name: 'Zena Kelley',
    username: 'velvetround',
    avatar: '/assets/user-images/image-zena.jpg',
  },
  {
    id: 'user-12',
    name: 'Jackson Barker',
    username: 'countryspirit',
    avatar: '/assets/user-images/image-jackson.jpg',
  },
];
export function actor(id: string) {
  return actors.find((item) => item.id === id) ?? actors[0];
}
