import { Outlet } from "react-router-dom";
import BottomNav from "../components/navigation/BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <div className="pb-14">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}