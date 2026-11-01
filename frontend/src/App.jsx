
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Menu from "./pages/Menu";
import OwnerAdmin from "./pages/OwnerAdmin";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerMenu from "./pages/OwnerMenu";
import OwnerNotifications from "./pages/OwnerNotifications";
import OwnerOffers from "./pages/OwnerOffers";
import OwnerProtectedRoute from "./pages/OwnerProtectedRoute";
import RestaurantSettings from "./pages/RestaurantSettings";
import SetOwnerPassword from "./pages/SetOwnerPassword";
import SuperAdmin from "./pages/SuperAdmin";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    CUSTOMER WEBSITE
                ========================= */}

                {/* Default customer menu */}
                <Route
                    path="/"
                    element={<Menu />}
                />

                {/* QR / shareable restaurant menu */}
                <Route
                    path="/menu/:restaurantId"
                    element={<Menu />}
                />


                {/* =========================
                    OWNER AUTHENTICATION
                ========================= */}

                <Route
                    path="/owner-login"
                    element={<OwnerLogin />}
                />

                <Route
                    path="/set-owner-password"
                    element={
                        <OwnerProtectedRoute>
                            <SetOwnerPassword />
                        </OwnerProtectedRoute>
                    }
                />


                {/* =========================
                    OWNER PANEL
                ========================= */}

                <Route
                    path="/owner-admin"
                    element={
                        <OwnerProtectedRoute>
                            <OwnerAdmin />
                        </OwnerProtectedRoute>
                    }
                />

                <Route
                    path="/owner-menu"
                    element={
                        <OwnerProtectedRoute>
                            <OwnerMenu />
                        </OwnerProtectedRoute>
                    }
                />

                <Route
                    path="/restaurant-settings"
                    element={
                        <OwnerProtectedRoute>
                            <RestaurantSettings />
                        </OwnerProtectedRoute>
                    }
                />

                <Route
                    path="/owner-offers"
                    element={
                        <OwnerProtectedRoute>
                            <OwnerOffers />
                        </OwnerProtectedRoute>
                    }
                />

                <Route
                    path="/owner-notifications"
                    element={
                        <OwnerProtectedRoute>
                            <OwnerNotifications />
                        </OwnerProtectedRoute>
                    }
                />


                {/* =========================
                    SUPER ADMIN
                ========================= */}

                <Route
                    path="/super-admin"
                    element={<SuperAdmin />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
