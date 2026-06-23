export type PublicPage = 'markets' | 'leaderboard' | 'activity';

export type AppShell = 'public' | 'admin';

export function getManageTitle() {
  return { title: 'Market administration', subtitle: 'Create drafts, manage categories, and publish markets' };
}

export function getBrowseTitle(isPublic: boolean) {
  return {
    title: 'Markets',
    subtitle: isPublic ? 'Public market catalog — sign in to place bets' : 'Browse live prediction markets and place bets',
  };
}

export function getLeaderboardTitle() {
  return {
    title: 'Leaderboard',
    subtitle: 'Top traders ranked by profit, volume, and win rate this week',
  };
}

export function getActivityTitle() {
  return {
    title: 'Activity',
    subtitle: 'Live feed of bets and market moves across Goaname',
  };
}

export function getPublicPageMeta(page: PublicPage) {
  switch (page) {
    case 'leaderboard':
      return getLeaderboardTitle();
    case 'activity':
      return getActivityTitle();
    default:
      return getBrowseTitle(true);
  }
}
