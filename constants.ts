
import { ThemeType } from './types';

export const THEMES = [
  {
    id: ThemeType.ADVENTURE,
    title: 'Adventure',
    description: 'Brave quests through magical forests and mountains.',
    icon: '🏔️',
    color: 'bg-green-100 border-green-200 text-green-700',
    coverPrompt: 'A magical winding path leading to a glowing treehouse in a whimsical emerald forest, sparkling fireflies, soft morning light',
    // High-quality storybook illustration matching the prompt
    defaultCover: "https://qzuznszfmknjfxeetecy.supabase.co/storage/v1/object/public/app_storage/theme_covers/adventuretheme.png"
  },
  {
    id: ThemeType.SPACE,
    title: 'Space',
    description: 'Cosmic journeys to distant planets and galaxies.',
    icon: '🚀',
    color: 'bg-blue-100 border-blue-200 text-blue-700',
    coverPrompt: 'A friendly colorful rocket ship soaring past smiling moons and candy-colored nebulas, twinkling stars, vibrant purple and blue galaxy',
    defaultCover: "https://qzuznszfmknjfxeetecy.supabase.co/storage/v1/object/public/app_storage/theme_covers/spacetheme.png"
  },
  {
    id: ThemeType.UNDERWATER,
    title: 'Underwater',
    description: 'Ocean adventures with friendly sea creatures.',
    icon: '🌊',
    color: 'bg-cyan-100 border-cyan-200 text-cyan-700',
    coverPrompt: 'A vibrant coral kingdom under the sea with glowing jellyfish and friendly sea turtles, shimmering turquoise water, sunbeams piercing through the surface',
    defaultCover: "https://qzuznszfmknjfxeetecy.supabase.co/storage/v1/object/public/app_storage/theme_covers/underwatertheme.png"
  },
  {
    id: ThemeType.FAIRY_TALE,
    title: 'Fairy Tale',
    description: 'Enchanted castles, dragons, and magical friends.',
    icon: '🏰',
    color: 'bg-pink-100 border-pink-200 text-pink-700',
    coverPrompt: 'A magnificent pink and gold castle floating on a soft cloud, surrounded by a rainbow and friendly tiny dragons, magical sparkles everywhere',
    defaultCover: "https://qzuznszfmknjfxeetecy.supabase.co/storage/v1/object/public/app_storage/theme_covers/fairytaletheme.png"
  },
  {
    id: ThemeType.DINOSAUR,
    title: 'Dinosaur',
    description: 'Prehistoric world with friendly dinosaur companions.',
    icon: '🦖',
    color: 'bg-amber-100 border-amber-200 text-amber-700',
    coverPrompt: 'A lush prehistoric valley with a friendly long-necked dinosaur eating leaves from a giant flower tree, vibrant tropical jungle, bright sunny day',
    defaultCover: "https://qzuznszfmknjfxeetecy.supabase.co/storage/v1/object/public/app_storage/theme_covers/dinosaurtheme.png"
  }
];

export const THEME_PROMPT_VARIATIONS: Record<ThemeType, string[]> = {
  [ThemeType.ADVENTURE]: [
    "{child_name} discovers a hidden map leading to a magical treehouse kingdom",
    "{child_name} befriends a talking fox on a quest to find the Crystal of Courage",
    "{child_name} climbs the Whispering Mountains to meet the Cloud Giants"
  ],
  [ThemeType.SPACE]: [
    "{child_name} builds a cardboard rocket that accidentally launches to the Moon",
    "{child_name} finds a friendly alien named Ziggy in the Martian gardens",
    "{child_name} helps the Star Keeper relight the flickering constellations"
  ],
  [ThemeType.UNDERWATER]: [
    "{child_name} finds a shimmering shell that lets them talk to dolphins",
    "{child_name} visits the Great Coral City to attend the Mermaid's Parade",
    "{child_name} helps a lost baby turtle find its way home through the Blue Trench"
  ],
  [ThemeType.FAIRY_TALE]: [
    "{child_name} is invited to a tea party by a polite dragon named Barnaby",
    "{child_name} wakes up in a castle where the furniture loves to sing",
    "{child_name} helps a clumsy wizard find his lost wand in the Whispering Woods"
  ],
  [ThemeType.DINOSAUR]: [
    "{child_name} travels back in time to play hide-and-seek with a Triceratops",
    "{child_name} helps a Brachiosaurus find the tastiest leaves on the highest tree",
    "{child_name} organizes a race between the swiftest raptors in the valley"
  ]
};

export const STORYBOOK_PRICE = 499;

export const STORYBOOK_STYLE_KEYWORDS = "Whimsical children's storybook illustration, digital art with soft watercolor textures, vibrant and playful colors, clean lines, professional character design, friendly atmosphere, magical lighting, high quality children's publishing style";
