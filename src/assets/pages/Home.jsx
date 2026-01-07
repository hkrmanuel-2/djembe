import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { userProfile, userType } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 space-y-12 p-6">
      {/* Welcome Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white mb-2">
          Welcome to Djembe 🪘
        </h1>
        {userProfile && (
          <p className="text-xl text-gray-300">
            Hello, {userProfile.first_name} {userProfile.last_name}!
          </p>
        )}
        <p className="text-lg text-gray-400">
          {userType === "teacher"
            ? "You are logged in as a Teacher"
            : "You are logged in as a Student"}
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link to="/daw">
            <Button size="lg" className="text-lg px-8 py-6">
              Open DAW-Lite
            </Button>
          </Link>
        </div>
      </div>

      {/* Worlds Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-semibold text-white mb-4">Worlds 🌍</h2>
        <div className="flex gap-6 justify-center">
          <Link to="/world1">
            <Button size="lg" className="text-lg px-8 py-6">
              World 1
            </Button>
          </Link>
          <Link to="/world2">
            <Button size="lg" className="text-lg px-8 py-6">
              World 2
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
