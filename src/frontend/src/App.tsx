import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import LocationGateModal from "./components/LocationGateModal";
import Navbar from "./components/Navbar";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import B2BBuyerPage from "./pages/B2BBuyerPage";
import B2BSellerPage from "./pages/B2BSellerPage";
import ChatScreen from "./pages/ChatScreen";
import DealerDashboardPage from "./pages/DealerDashboardPage";
import DealerSignupPage from "./pages/DealerSignupPage";
import DemoPage from "./pages/DemoPage";
import HomePage from "./pages/HomePage";
import InstantBuyPage from "./pages/InstantBuyPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import MyAdsPage from "./pages/MyAdsPage";
import PostAdPage from "./pages/PostAdPage";
import ProfilePage from "./pages/ProfilePage";
import VendorDashboardPage from "./pages/VendorDashboardPage";

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: profile, isFetched, isLoading } = useGetCallerUserProfile();
  const showProfileSetup =
    !!identity && !isLoading && isFetched && profile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
      <LocationGateModal />
      <Toaster richColors position="top-right" />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const listingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$listingId",
  component: ListingDetailPage,
});
const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post",
  component: PostAdPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});
const myAdsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-ads",
  component: MyAdsPage,
});
const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { listingId?: string } => ({
    listingId: (search.listingId as string) ?? undefined,
  }),
});
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatScreen,
  validateSearch: (
    search: Record<string, unknown>,
  ): { listingId?: string } => ({
    listingId: (search.listingId as string) ?? undefined,
  }),
});
const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/demo",
  component: DemoPage,
});
const instantBuyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/instant-buy",
  component: InstantBuyPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const b2bRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/b2b",
  component: DealerSignupPage,
});
const dealerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dealer",
  component: DealerDashboardPage,
});
const vendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendor",
  component: VendorDashboardPage,
});
const b2bSellerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/b2b-seller",
  component: B2BSellerPage,
});
const b2bBuyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/b2b-buyer",
  component: B2BBuyerPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: () => {
    const navigate = useNavigate();
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center gap-4 text-center px-6">
        <span className="text-6xl">🔍</span>
        <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          data-ocid="notfound.primary_button"
        >
          Go Home
        </button>
      </div>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listingRoute,
  postRoute,
  profileRoute,
  myAdsRoute,
  messagesRoute,
  chatRoute,
  demoRoute,
  instantBuyRoute,
  adminRoute,
  b2bRoute,
  dealerRoute,
  vendorRoute,
  b2bSellerRoute,
  b2bBuyerRoute,
  loginRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
