import LiveBoardCard from "./LiveBoardCard";
import { Activity,TruckElectric } from "lucide-react";


export default function LiveBoard() {


  
  return (
        <section className="live-board">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2 mb-2">
          <TruckElectric/>
          <h2>Working right now</h2>
          <span className="count-badge">4</span>
        </div>
        <small className="flex flex-row items-center gap-1 text-xs text-gray-500">
          <Activity size={14} /> Live · Updated just now
        </small>
      </div>
      <div className="grid grid-cols-2">
        <LiveBoardCard/>
         

      </div>
 
    </section>
  )
}