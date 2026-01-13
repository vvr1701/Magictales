
import { ThemeType, Theme } from './types';

export const THEMES: Theme[] = [
  {
    id: ThemeType.ENCHANTED_FOREST,
    title: 'Enchanted Forest',
    description: 'A magical journey through whispering woods and singing streams.',
    icon: '🌳',
    ageRange: 'Ages 3-8',
    tags: ['Magic', 'Nature', 'Adventure'],
    color: 'bg-green-100 border-green-200 text-green-700',
    coverPrompt: 'A magical enchanted forest with sparkling trees, a purple singing stream, and soft pillow mountains in the distance, whimsical children\'s book illustration',
    defaultCover: "/enchanted_forest_cover.png"
  },
  {
    id: ThemeType.MAGIC_CASTLE,
    title: 'Magic Castle',
    description: 'First day at a magical academy with wizards and dragons.',
    icon: '🏰',
    ageRange: 'Ages 4-10',
    tags: ['Magic', 'School', 'Fantasy'],
    color: 'bg-purple-100 border-purple-200 text-purple-700',
    coverPrompt: 'A grand gothic castle magic school with towers disappearing into mist, a wise owl professor, and a baby dragon, cinematic magical atmosphere',
    defaultCover: "https://qzuznszfmknjfxeetecy.supabase.co/storage/v1/object/public/app_storage/theme_covers/fairytaletheme.png"
  },
  {
    id: ThemeType.SPY_MISSION,
    title: 'Spy Mission',
    description: 'A thrilling secret agent adventure with gadgets and mystery.',
    icon: '🕵️',
    ageRange: 'Ages 5-10',
    tags: ['Adventure', 'Mystery', 'Action'],
    color: 'bg-slate-100 border-slate-200 text-slate-700',
    coverPrompt: 'A secret spy headquarters with high-tech gadgets, mysterious shadows, and adventure equipment, exciting action illustration',
    defaultCover: "https://qzuznszfmknjfxeetecy.supabase.co/storage/v1/object/public/app_storage/theme_covers/spacetheme.png"
  }
];

export const THEME_PROMPT_VARIATIONS: Record<ThemeType, string[]> = {
  [ThemeType.ENCHANTED_FOREST]: [
    "{child_name} discovers a secret map to the Enchanted Forest",
    "{child_name} befriends Pip the squirrel and follows the silver trail",
    "{child_name} crosses the Singing Stream and climbs the Whispering Mountains"
  ],
  [ThemeType.MAGIC_CASTLE]: [
    "{child_name} arrives at the Grand Academy of Arcane Arts",
    "{child_name} meets Professor Hoot and learns to tame baby dragon Sparky",
    "{child_name} masters flying on a broomstick and explores the Ancient Library"
  ],
  [ThemeType.SPY_MISSION]: [
    "{child_name} receives a top-secret mission from headquarters",
    "{child_name} uses cool spy gadgets to solve the mystery",
    "{child_name} cracks the code and saves the day like a true secret agent"
  ]
};

export const STORYBOOK_PRICE = 499;

export const STORYBOOK_STYLE_KEYWORDS = "Whimsical children's storybook illustration, digital art with soft watercolor textures, vibrant and playful colors, clean lines, professional character design, friendly atmosphere, magical lighting, high quality children's publishing style";
