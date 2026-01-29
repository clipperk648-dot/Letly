import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const PropertyDetails = lazy(() => import("./pages/property-details"));
const LoginPage = lazy(() => import("./pages/login"));
const PropertySearch = lazy(() => import("./pages/property-search"));
const LandlordDashboard = lazy(() => import("./pages/landlord-dashboard"));
const LandlordActivity = lazy(() => import("./pages/landlord-dashboard/activity"));
const Register = lazy(() => import("./pages/register"));
const TenantDashboard = lazy(() => import("./pages/tenant-dashboard"));
const PropertyManagement = lazy(() => import("./pages/property-management"));
const InquiryManagement = lazy(() => import("./pages/inquiry-management"));
const ApplicationTracking = lazy(() => import("./pages/application-tracking"));
const Properties = lazy(() => import("./pages/properties"));
const Messages = lazy(() => import("./pages/messages"));
const MessageThread = lazy(() => import("./pages/messages/Thread"));
const CommunityMessages = lazy(() => import("./pages/messages/CommunityMessages"));
const Analytics = lazy(() => import("./pages/analytics"));
const Favorites = lazy(() => import("./pages/favorites"));
const Profile = lazy(() => import("./pages/profile"));
const Settings = lazy(() => import("./pages/settings"));
const Billing = lazy(() => import("./pages/billing"));
const Notifications = lazy(() => import("./pages/notifications"));
const Help = lazy(() => import("./pages/help"));
const Support = lazy(() => import("./pages/support"));
const BulkEdit = lazy(() => import("./pages/bulk-edit"));
const ExportPage = lazy(() => import("./pages/export"));
const Reports = lazy(() => import("./pages/reports"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Feed = lazy(() => import("./pages/feed"));
const Explore = lazy(() => import("./pages/explore"));
const SocialProfile = lazy(() => import("./pages/social-profile"));
const CreatePost = lazy(() => import("./pages/create-post"));
const SocialNotifications = lazy(() => import("./pages/social-notifications"));
const SocialMessages = lazy(() => import("./pages/social-messages"));

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <RouterRoutes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/landlord" element={<LoginPage intendedRole="landlord" />} />
            <Route path="/login/tenant" element={<LoginPage intendedRole="tenant" />} />
            <Route path="/register" element={<Register />} />

            {/* Public pages */}
            <Route path="/property-search" element={<PropertySearch />} />
            <Route path="/property-details" element={<PropertyDetails />} />

            {/* Social Platform Pages */}
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/social-notifications" element={<ProtectedRoute><SocialNotifications /></ProtectedRoute>} />
            <Route path="/social-messages" element={<ProtectedRoute><SocialMessages /></ProtectedRoute>} />
            <Route path="/social-profile" element={<ProtectedRoute><SocialProfile /></ProtectedRoute>} />

            {/* Protected: Landlord only */}
            <Route path="/landlord-dashboard" element={<ProtectedRoute allowedRole="landlord"><LandlordDashboard /></ProtectedRoute>} />
            <Route path="/landlord-dashboard/activity" element={<ProtectedRoute allowedRole="landlord"><LandlordActivity /></ProtectedRoute>} />
            <Route path="/property-management" element={<ProtectedRoute allowedRole="landlord"><PropertyManagement /></ProtectedRoute>} />
            <Route path="/bulk-edit" element={<ProtectedRoute allowedRole="landlord"><BulkEdit /></ProtectedRoute>} />

            {/* Protected: Tenant only */}
            <Route path="/tenant-dashboard" element={<ProtectedRoute allowedRole="tenant"><TenantDashboard /></ProtectedRoute>} />

            {/* Shared protected pages */}
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:id" element={<ProtectedRoute><MessageThread /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/account-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/account-notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><ApplicationTracking /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
