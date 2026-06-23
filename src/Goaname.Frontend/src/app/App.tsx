import { useEffect, useRef, useState } from 'react';
import { listCategories } from '../api/categories';
import { TENANT_ID, listMarkets, type MarketDto } from '../api/markets';
import { ActivityPage } from '../components/activity';
import { MarketAdminPanel } from '../components/admin';
import { AuthPanel } from '../components/auth';
import {
  AppSidenav,
  AppTopbar,
  getManageTitle,
  getPublicPageMeta,
  PublicBottomNav,
  PublicNav,
  type AppShell,
  type PublicPage,
} from '../components/layout';
import { LeaderboardPage } from '../components/leaderboard';
import {
  ActivityTicker,
  filterMarkets,
  MarketBrowseFilters,
  MarketGrid,
  MarketGridSkeleton,
  type CategoryFilter,
} from '../components/markets';
import {
  Alert,
  appContainerClass,
  EmptyState,
  LoadingOverlay,
  Modal,
  pageBgClass,
  PageHeader,
  publicContainerClass,
  publicMobileBottomPadClass,
} from '../components/ui';
import { useAuth } from '../hooks/useAuth';

async function ensureDemoTenant() {
  await fetch(`/api/tenants/${TENANT_ID}/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Demo Markets', currency: 'USD' }),
  }).catch(() => undefined);
}

function App() {
  const { user, wallet, loading: authLoading, error, isAuthenticated, signIn, signUp, signOut } = useAuth();
  const [shell, setShell] = useState<AppShell>('public');
  const [publicPage, setPublicPage] = useState<PublicPage>('markets');
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [markets, setMarkets] = useState<MarketDto[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [marketsError, setMarketsError] = useState<string | null>(null);
  const [marketsRefreshKey, setMarketsRefreshKey] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const refreshMarkets = () => setMarketsRefreshKey((current) => current + 1);
  const filteredMarkets = filterMarkets(markets, searchQuery, selectedCategory);
  const wasAuthenticated = useRef(isAuthenticated);
  const showTicker = (page: PublicPage) => page !== 'activity';

  useEffect(() => {
    void ensureDemoTenant();
  }, []);

  useEffect(() => {
    void listCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, [marketsRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    setMarketsLoading(true);
    setMarketsError(null);

    void listMarkets()
      .then((items) => {
        if (!cancelled) {
          setMarkets(items);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMarketsError(err instanceof Error ? err.message : 'Failed to load markets');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMarketsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [marketsRefreshKey]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShell('public');
      wasAuthenticated.current = false;
      return;
    }

    setShowAuthPanel(false);
    if (!wasAuthenticated.current) {
      setShell('admin');
    }
    wasAuthenticated.current = true;
  }, [isAuthenticated]);

  function openSignIn() {
    setShowAuthPanel(true);
  }

  function openManage() {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    setShell('admin');
  }

  function handleLogout() {
    signOut();
    setShell('public');
    setPublicPage('markets');
    setMobileNavOpen(false);
  }

  function backToSite(page: PublicPage = 'markets') {
    setShell('public');
    setPublicPage(page);
    setMobileNavOpen(false);
  }

  const browseContent = (
    <>
      {isAuthenticated && user && user.kycStatus !== 'Verified' && (
        <Alert variant="accent" className="mb-6">
          Link your payout account to enable instant withdrawals.
        </Alert>
      )}

      {error && isAuthenticated && (
        <Alert className="mb-4">{error}</Alert>
      )}

      {marketsError && (
        <Alert className="mb-4">{marketsError}</Alert>
      )}

      {!marketsLoading && (
        <MarketBrowseFilters
          categories={categories}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          resultCount={filteredMarkets.length}
        />
      )}

      {marketsLoading && <MarketGridSkeleton />}

      {!marketsLoading && markets.length === 0 && (
        <EmptyState
          title="No markets yet"
          description={
            isAuthenticated
              ? 'Open Manage to create and publish markets.'
              : 'Sign in to create and publish markets.'
          }
        />
      )}

      {!marketsLoading && markets.length > 0 && filteredMarkets.length === 0 && (
        <EmptyState
          title="No matches found"
          description="Try a different search or category."
        />
      )}

      {!marketsLoading && filteredMarkets.length > 0 && (
        <MarketGrid
          markets={filteredMarkets}
          isAuthenticated={isAuthenticated}
          onSignIn={openSignIn}
        />
      )}
    </>
  );

  function renderPublicContent(page: PublicPage) {
    switch (page) {
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'activity':
        return <ActivityPage />;
      default:
        return browseContent;
    }
  }

  const authModal = showAuthPanel && (
    <Modal open={showAuthPanel} onClose={() => setShowAuthPanel(false)}>
      <AuthPanel
        onClose={() => setShowAuthPanel(false)}
        onLogin={async (email, password) => {
          await signIn(email, password);
        }}
        onRegister={async (displayName, email, password) => {
          await signUp(displayName, email, password);
        }}
      />
    </Modal>
  );

  if (isAuthenticated && user && shell === 'admin') {
    const manageMeta = getManageTitle();

    return (
      <>
        <div className={`flex min-h-screen ${pageBgClass}`}>
          <AppSidenav
            user={user}
            wallet={wallet}
            onBackToSite={() => backToSite('markets')}
            onLogout={handleLogout}
            tenantId={TENANT_ID}
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <AppTopbar
              title={manageMeta.title}
              subtitle={manageMeta.subtitle}
              badge="Admin"
              onMenuClick={() => setMobileNavOpen(true)}
            />
            <div className={`${appContainerClass} flex-1`}>
              <MarketAdminPanel onMarketsChanged={refreshMarkets} />
            </div>
          </div>
        </div>
        {authLoading && <LoadingOverlay message="Loading account..." />}
      </>
    );
  }

  const publicMeta = getPublicPageMeta(publicPage);

  return (
    <>
      <div className={`min-h-screen ${publicMobileBottomPadClass} ${pageBgClass}`}>
        <PublicNav
          activePage={publicPage}
          onNavigate={setPublicPage}
          liveCount={markets.length}
          onSignIn={openSignIn}
          user={user}
          wallet={wallet}
          onManage={isAuthenticated ? openManage : undefined}
          onLogout={isAuthenticated ? handleLogout : undefined}
        />

        <main className={publicContainerClass}>
          <PageHeader
            title={publicMeta.title}
            subtitle={publicMeta.subtitle}
            size="hero"
            className="mb-6 sm:mb-8"
          />

          {renderPublicContent(publicPage)}
        </main>

        <PublicBottomNav activePage={publicPage} onNavigate={setPublicPage} />
        {showTicker(publicPage) && <ActivityTicker markets={markets} />}
      </div>

      {authModal}

      {authLoading && isAuthenticated && (
        <LoadingOverlay message="Loading account..." />
      )}
    </>
  );
}

export default App;
