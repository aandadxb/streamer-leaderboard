// types.ts

export interface Player {
  id: string;
  rank: number;
  username: string; // e.g., "****ren" (Masked for privacy)
  wagered: number;  // e.g., 10996.40 (Raw number, frontend handles currency formatting)
  deposited: number;
}

// THIS IS THE JSON BLUEPRINT THE BACKEND MUST RETURN
export interface CampaignResponse {
  streamer: {
    name: string;
    avatarUrl: string; // URL for the Streamer's face/logo
    bannerUrl: string; // URL for the background banner
    customHeadline?: string; // Optional: e.g., "Win an iPhone 17, iPad, or Apple Watch!"
    stag: string; // The specific tracking parameter for CTAs e.g., "149542"
    registrationUrl?: string; // Custom registration URL for Join Now button
    loginUrl?: string; // Custom login URL
    ctaUrl?: string; // Custom CTA URL
    termsAndConditionsHtml?: string; // Custom T&C HTML content for modal
  };
  campaign: {
    startDate?: string | null; // ISO 8601 UTC string
    endDate: string; // ISO 8601 UTC string (e.g., "2026-02-28T23:59:59Z")
    usePointsTerminology: boolean; // True = Show "Points", False = Show "Wagered Amount"
    firstPrizeUnlockThreshold: number; // Turnover limit to unlock 1st prize (e.g., 15000). Set to 0 if N/A.
    
    // Prizes for the Podium!
    prizes?: {
      1?: string;
      2?: string;
      3?: string;
    };
  };
  leaderboard: {
    lastUpdated: string; // ISO 8601 UTC string (Time of last successful fetch)
    nextUpdate: string; // ISO 8601 UTC string (Calculated by backend: lastUpdated + 15 mins)
    players: Player[]; // Backend sorts and limits this array to the Top 10
    podiumPlayers: Player[]; // Top players who meet prize minimum thresholds
  };
}