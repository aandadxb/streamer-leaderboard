// mockData.ts
import { CampaignResponse } from './types';

// --------------------------------------------------------
// 1. MOCK DATA FOR DYNAMIC STREAMER PAGES (e.g., /garret-star)
// --------------------------------------------------------
export const getMockCampaignData = (slug: string): CampaignResponse => {
  // Automatically sets the end date to exactly 5 days from right now
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 5);

  return {
    streamer: {
      name: "Garret Star",
      avatarUrl: "/assets/garret-avatar.jpeg", // Streamer Avatar
      bannerUrl: "/assets/banner.png",
      customHeadline: "Win an iPhone 17, iPad, or Apple Watch!", 
      stag: "149542" // Garret's Exact STAG
    },
    campaign: {
      endDate: endDate.toISOString(), 
      usePointsTerminology: false,
      firstPrizeUnlockThreshold: 15000, 
      prizes: {
        1: "iPhone 17",
        2: "iPad",
        3: "Apple Watch"
      }
    },
    leaderboard: {
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 15 * 60000).toISOString(),
      players: [
        { id: '1', rank: 1, username: 'str***er1', wagered: 10996.40, deposited: 0 },
        { id: '2', rank: 2, username: 'gam***99', wagered: 8845.40, deposited: 0 },
        { id: '3', rank: 3, username: 'luc***ky', wagered: 6396.38, deposited: 0 },
        { id: '4', rank: 4, username: 'bet***mx', wagered: 5200.00, deposited: 0 },
        { id: '5', rank: 5, username: 'hig***ll', wagered: 4100.50, deposited: 0 },
        { id: '6', rank: 6, username: 'xqc***fan', wagered: 3500.00, deposited: 0 },
        { id: '7', rank: 7, username: 'nin***ja', wagered: 2800.75, deposited: 0 },
        { id: '8', rank: 8, username: 'pro***gam', wagered: 2100.00, deposited: 0 },
        { id: '9', rank: 9, username: 'noo***b69', wagered: 1500.25, deposited: 0 },
        { id: '10', rank: 10, username: 'win***ner', wagered: 950.00, deposited: 0 },
      ],
      podiumPlayers: [
        { id: '1', rank: 1, username: 'str***er1', wagered: 10996.40, deposited: 0 },
        { id: '2', rank: 2, username: 'gam***99', wagered: 8845.40, deposited: 0 },
        { id: '3', rank: 3, username: 'luc***ky', wagered: 6396.38, deposited: 0 },
      ]
    }
  };
};

// --------------------------------------------------------
// 2. MOCK DATA EXCLUSIVELY FOR THE GLOBAL HOME PAGE (/)
// --------------------------------------------------------
export const getHomeMockData = (): CampaignResponse => {
  // Sets the home page to end in 10 days
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 10);

  return {
    streamer: {
      name: "Lucky Dreams", 
      avatarUrl: "", // Triggers the "LD" text fallback logo
      bannerUrl: "/assets/banner.png",
      customHeadline: "Global Wager Race",
      stag: "GLOBAL_2026" 
    },
    campaign: {
      endDate: endDate.toISOString(), 
      usePointsTerminology: false,
      firstPrizeUnlockThreshold: 0, // 0 = No lock mechanism on the home page
      // No prizes object here, so the pills just won't render on the home page!
    },
    leaderboard: {
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 15 * 60000).toISOString(),
      players: [
        { id: '1', rank: 1, username: 'glo***bal1', wagered: 25000.00, deposited: 0 },
        { id: '2', rank: 2, username: 'mas***ter', wagered: 18000.50, deposited: 0 },
        { id: '3', rank: 3, username: 'luc***ky', wagered: 12000.00, deposited: 0 },
        { id: '4', rank: 4, username: 'pla***yer4', wagered: 945.80, deposited: 0 },
        { id: '5', rank: 5, username: 'pla***yer5', wagered: 945.80, deposited: 0 },
        { id: '6', rank: 6, username: 'pla***yer6', wagered: 945.80, deposited: 0 },
        { id: '7', rank: 7, username: 'pla***yer7', wagered: 945.80, deposited: 0 },
        { id: '8', rank: 8, username: 'pla***yer8', wagered: 945.80, deposited: 0 },
        { id: '9', rank: 9, username: 'pla***yer9', wagered: 945.80, deposited: 0 },
        { id: '10', rank: 10, username: 'pla***yer10', wagered: 945.80, deposited: 0 },
      ],
      podiumPlayers: [
        { id: '1', rank: 1, username: 'glo***bal1', wagered: 25000.00, deposited: 0 },
        { id: '2', rank: 2, username: 'mas***ter', wagered: 18000.50, deposited: 0 },
        { id: '3', rank: 3, username: 'luc***ky', wagered: 12000.00, deposited: 0 },
      ]
    }
  };
};