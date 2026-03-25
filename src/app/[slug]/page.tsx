import { notFound } from 'next/navigation';
import { getCampaignData } from '@/lib/streamer-data';
import { HeroBanner } from '../components/HeroBanner';
import { HowItWorks } from '../components/HowItWorks';
import { Podium } from '../components/Podium';
import { Leaderboard } from '../components/Leaderboard';
import { PrimaryButton } from '../components/PrimaryButton';
import { CountdownClient } from './CountdownClient';
import { StickyBar } from './StickyBar';
import { Footer } from '../components/Footer';

export const revalidate = 900;

export default async function StreamerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCampaignData(slug);

  if (!data) notFound();

  const joinHref = data.streamer.registrationUrl || `https://Luckydreams.info/kytbkll0i?stag=${data.streamer.stag}`;
  const ctaHref = data.streamer.ctaUrl || `https://www.luckydreams.com/?stag=${data.streamer.stag}`;
  const loginHref = data.streamer.loginUrl || 'https://www.luckydreams.com/';

  const topThree = data.leaderboard.podiumPlayers;
  const topPlayer = data.leaderboard.players[0];
  const threshold = data.campaign.firstPrizeUnlockThreshold;
  const isPrizeUnlocked = topPlayer && topPlayer.wagered >= threshold;
  const amountToUnlock = topPlayer ? Math.max(0, threshold - topPlayer.wagered) : threshold;

  const startDateText = data.campaign.startDate
    ? new Date(data.campaign.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : undefined;

  return (
    <>
    <main className="w-full max-w-[1520px] mx-auto px-4 md:px-12 flex flex-col gap-5 md:gap-8 relative pb-8 lg:pb-10">

      {/* Header */}
      <div className="w-full relative z-20 flex flex-col items-center lg:flex-row lg:justify-between gap-4 mt-4 md:mt-8 pb-6 lg:pb-0">
        <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4">
          <div className="w-14 h-14 lg:w-12 lg:h-12 rounded-full border-[1.5px] flex items-center justify-center overflow-hidden bg-brand-dark">
            {data.streamer.avatarUrl ? (
               <img src={data.streamer.avatarUrl} alt={data.streamer.name} className="w-full h-full object-cover" />
            ) : (
               <span className="font-hero font-bold text-lg text-brand-gold">{data.streamer.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <span className="font-hero font-bold text-lg lg:text-xl text-brand-offwhite leading-none tracking-wide">{data.streamer.name}</span>
            <span className="font-hero font-medium text-[10px] text-brand-gold uppercase tracking-widest mt-1">Official Leaderboard</span>
          </div>
        </div>

        <div className="hidden lg:flex gap-4">
          <PrimaryButton href={joinHref} className="px-6 py-2">Join Now</PrimaryButton>
          <a href={loginHref} className="px-6 py-2 rounded-full border border-brand-offwhite text-brand-offwhite text-sm hover:bg-brand-offwhite/10 transition-colors inline-flex items-center justify-center">Log In</a>
        </div>
      </div>

      <HeroBanner bannerUrl={data.streamer.bannerUrl} />

      <div className="hidden lg:block w-full relative z-20">
        <HowItWorks ctaHref={ctaHref} />
      </div>

      {/* Main Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[6fr_4fr] gap-10 lg:gap-12 items-start relative z-20">
        <div className="flex flex-col w-full order-1">
          <h2 className="font-hero text-xl lg:text-3xl font-medium text-white mb-2 lg:mb-5 text-center">Top Winners</h2>
          <Podium topPlayers={topThree} usePoints={data.campaign.usePointsTerminology} prizes={data.campaign.prizes} />
        </div>

        <div className="flex flex-col w-full order-2">
          <h2 className="font-hero text-xl lg:text-3xl font-medium text-white mb-2 lg:mb-5 text-center lg:text-left">{data.streamer.name} Leaderboard</h2>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-center lg:justify-start">
              <CountdownClient
                endDate={data.campaign.endDate}
                startDateText={startDateText}
              />
            </div>

            {threshold > 0 && !isPrizeUnlocked && (
              <div className="bg-[#161F3D] border border-brand-gold/20 rounded-xl p-4 md:p-5 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-hero font-bold text-brand-gold text-sm">🔒 1st Prize Locked</span>
                  <span className="font-hero font-medium text-brand-offwhite text-xs opacity-80">Goal: {Math.round(threshold * 5).toLocaleString('en-US')} pts</span>
                </div>
                <div className="w-full bg-brand-dark h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-gradient-to-r from-brand-gold-dark to-brand-gold h-full transition-all" style={{ width: `${Math.min(100, ((topPlayer?.wagered || 0) / threshold) * 100)}%` }} />
                </div>
                <p className="font-hero text-xs text-brand-offwhite/80 text-center">Top player needs <span className="font-bold text-white">{Math.round(amountToUnlock * 5).toLocaleString('en-US')} pts</span> more to unlock!</p>
              </div>
            )}

            <Leaderboard players={data.leaderboard.players} lastUpdatedISO={data.leaderboard.lastUpdated} nextUpdateISO={data.leaderboard.nextUpdate} unlockThreshold={threshold} usePoints={data.campaign.usePointsTerminology} />
          </div>
        </div>
      </div>

      {/* Mobile Inline Section (Observed by StickyBar) */}
      <div id="mobile-inline-buttons" className="flex lg:hidden flex-col items-center gap-6 w-full relative z-20">
        <HowItWorks ctaHref={ctaHref} />
        <div className="flex items-center justify-center gap-4 w-full px-4">
          <a href={loginHref} className="flex-1 py-3 rounded-full bg-[#212D57] text-brand-offwhite text-sm border border-white/10 text-center">Log In</a>
          <PrimaryButton href={joinHref} className="flex-1 py-3 text-sm">Join Now</PrimaryButton>
        </div>
      </div>

      {/* Sticky Mobile Buttons */}
      <StickyBar joinHref={joinHref} loginHref={loginHref} />

    </main>
    <Footer termsHtml={data.streamer.termsAndConditionsHtml || undefined} />
    </>
  );
}
