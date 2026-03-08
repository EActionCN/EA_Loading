const CONFIG = {

  serverName: 'E-Action RolePlay',
  logoUrl: 'https://r2.fivemanage.com/N3k1nuBG7ZNDWV2t3hiEb/EALOGO6_nobackground.png',

  // videoUrl: set a video URL to use video background, or leave empty to use carousel
  videoUrl: '',

  // Background image carousel (active when videoUrl is empty)
  carousel: {
    images: [
      { src: 'https://r2.fivemanage.com/N3k1nuBG7ZNDWV2t3hiEb/VphuCXVBkHlC.webp', alt: 'Scene 1' },
      { src: 'https://r2.fivemanage.com/N3k1nuBG7ZNDWV2t3hiEb/5yWAkyn6hK7u.webp', alt: 'Scene 2' },
      { src: 'https://r2.fivemanage.com/N3k1nuBG7ZNDWV2t3hiEb/VphuCXVBkHlC.webp', alt: 'Scene 3' },
      { src: 'https://placehold.co/1920x1080/100f15/1f1a2a?text=Scene+04', alt: 'Scene 4' },
    ],
    interval: 3000,
    transitionDuration: 1.5,
    kenBurns: true,
    brightness: 0.7,
    contrast: 1.1,
  },

  musicUrl: 'https://r2.fivemanage.com/xxxxxxxxxx/EA_BGM.mp3',
  musicVolume: 0.3,

  discordUrl: 'https://discord.com/invite/FNZuMBuzRj',

  loaderPrefix: 'SYS.BOOT_',

  navItems: [
    { key: 'about',   label: 'ABOUT' },
    { key: 'news',    label: 'NEWS' },
    { key: 'gallery', label: 'GALLERY' },
  ],

  about: {
    title:       'E-ACTION',
    subtitle:    'ROLEPLAY',
    description: 'An immersive roleplay community dedicated to crafting the most authentic urban life simulation, where every player can write their own story.',
    stats: [
      { value: '200+', label: 'ACTIVE PLAYERS' },
      { value: '24/7', label: 'ONLINE' },
      { value: '50+',  label: 'CUSTOM JOBS' },
      { value: '2024', label: 'ESTABLISHED' },
    ],
  },

  news: [
    {
      date:    '2026.02.20',
      title:   'v2.5 Update — New Career System',
      summary: 'Police, medical, lawyer and more career paths are now live, bringing richer role experiences.',
    },
    {
      date:    '2026.01.15',
      title:   'Lunar New Year Event',
      summary: 'Limited vehicles, red envelope system and fireworks show, running through the end of February.',
    },
    {
      date:    '2025.12.01',
      title:   'Server Performance Optimization',
      summary: 'Major improvements to network sync and resource loading for a smoother gameplay experience.',
    },
  ],

  announcements: [
    { text: 'Welcome to E-Action RolePlay — Respect all players and stay in character.' },
    { text: 'Admin team is online 24/7 — Use /report for any issues.' },
    { text: 'New career system is live — Try out Police, Medic, and Lawyer roles!' },
    { text: 'Server restart scheduled daily at 06:00 UTC for optimal performance.' },
    { text: 'Join our Discord community for events, giveaways and announcements.' },
  ],
  announcementInterval: 5000,

  gallery: [
    { src: 'https://placehold.co/800x450/0d0d0d/1a1a1a?text=01', alt: 'Screenshot 1' },
    { src: 'https://placehold.co/800x450/0d0d0d/1a1a1a?text=02', alt: 'Screenshot 2' },
    { src: 'https://placehold.co/800x450/0d0d0d/1a1a1a?text=03', alt: 'Screenshot 3' },
    { src: 'https://placehold.co/800x450/0d0d0d/1a1a1a?text=04', alt: 'Screenshot 4' },
    { src: 'https://placehold.co/800x450/0d0d0d/1a1a1a?text=05', alt: 'Screenshot 5' },
    { src: 'https://placehold.co/800x450/0d0d0d/1a1a1a?text=06', alt: 'Screenshot 6' },
  ],
};
