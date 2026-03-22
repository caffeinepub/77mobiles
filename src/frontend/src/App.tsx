import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import HomePage from "./pages/HomePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import MessagesPage from "./pages/MessagesPage";
import PostAdPage from "./pages/PostAdPage";
import ProfilePage from "./pages/ProfilePage";

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: profile, isFetched, isLoading } = useGetCallerUserProfile();
  const showProfileSetup =
    !!identity && !isLoading && isFetched && profile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
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
const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listingRoute,
  postRoute,
  profileRoute,
  messagesRoute,
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
