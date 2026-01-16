// app/page.tsx
// import ProtectedRoute from '@/components/ProtectedRoute';
import ChatLayout from "./chat-layout";
import { getShips } from '@/actions/entity';
import { getUserSelection } from "@/actions/user_selection";

export default async function Home() {
  // Fetch data ( will handle auth check on client side)
  const user_selectiondata = await getUserSelection();
  const ships = await getShips();
  
  if (ships.length === 0) {
    return (
      // <ProtectedRoute>
        <div className="p-4 text-center text-gray-500">
          No ships found.
        </div>
      // </ProtectedRoute>
    );
  }

  return (
    <>
      {/* <ChatLayout ships={ships} user_selectiondata={user_selectiondata} /> */}
    {/* <ProtectedRoute> */}
      <ChatLayout ships={ships} user_selectiondata={user_selectiondata} />
    {/* </ProtectedRoute> */}
    </>
  );
}