type InitialProps = {
  id: string;
  name: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const color = ["teal", "blue", "violet", "orange", "rose", "cyan"] as const;

// Ids from the database are text (uuid), so add up the character codes to pick a color.
export function bgColor(id: string) {
  let total = 0;
  for (const char of id) total += char.charCodeAt(0);
  return color[total % color.length];
}

export default function Initials({ id, name }: InitialProps) {
  return (
    <span className={`admin-user-initials ${bgColor(id)}`}>
      {getInitials(name)}
    </span>
  );
}
