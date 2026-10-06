import type { AdminUser } from "../_lib/types";
import Initials from "./Initials";



export default function AdminUser({ id, name, title }: AdminUser) {
  return (
    <div className="admin-user">
      <Initials id={id} name={name} />
      <div className="admin-user-info">
        <span className="admin-user-name">{name}</span>
        <span className="admin-user-title">{title}</span>
      </div>
    </div>
  );
}