type InitialProps = {
  id: number;
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

export function bgColor(id: number) {
  return color[(id - 1) % color.length];
}

export default function Initials({ id, name }: InitialProps) {
  return (
    <span className={`admin-user-initials ${bgColor(id)}`}>
      {getInitials(name)}
    </span>
  );
}
