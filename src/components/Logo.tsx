import { Boxes } from "lucide-react";

/** ASystem wordmark: lime mark (matches the architecture core node) + "asystem.ai".
 *  Lime is used as a fill (mark), never as text on white — per the brand rule. */
const Logo = ({
  mark = "h-8 w-8",
  icon = "h-[18px] w-[18px]",
  text = "text-base",
}: {
  mark?: string;
  icon?: string;
  text?: string;
}) => (
  <span className="flex items-center gap-2.5">
    <span className={`grid shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground ${mark}`}>
      <Boxes className={icon} />
    </span>
    <span className={`font-display font-extrabold tracking-tight ${text}`}>
      asystem<span className="text-muted-foreground">.ai</span>
    </span>
  </span>
);

export default Logo;
