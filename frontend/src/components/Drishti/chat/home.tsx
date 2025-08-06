import Auth from "../auth";
import ChatLayout from "./chat-layout"; // New client component
import { getShips } from '@/actions/entity';
import KnowledgeGraph from "../test";

export interface ShipsListProps {
  skip?: number;
  limit?: number;
}

export default async function ScriptClone() {
  try {
    let authorized = true
    if (authorized === false) {
      return (
        <Auth />
      );
    }

    const ships = await getShips();
    if (ships.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No ships found.
        </div>
      );
    }

    return <ChatLayout ships={ships} />;
  } catch (error) {
    return (
      <div className="p-4 text-center font-urbanist">
        <div className="text-red-500 mb-2">Failed to load ships</div>
        <p className="text-gray-500 text-sm">Please try again later</p>
      </div>
    );
  }
}