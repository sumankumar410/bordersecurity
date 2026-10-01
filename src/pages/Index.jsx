import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
const Index = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Dashboard /> : <LoginPage />;
};
export default Index;
