import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRoute } from "@/config/roles";

const NotFound = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF9F3] p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-[#0F1B33]">404</p>
        <p className="mt-3 text-lg text-gray-600">This page doesn't exist.</p>
        <Link
          to={getHomeRoute(user?.role)}
          className="mt-6 inline-flex rounded-xl bg-[#0F1B33] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1c3154]"
        >
          {user ? "Back to dashboard" : "Go to login"}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
