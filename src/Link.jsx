import { Link } from "solid-app-router";

const LinkBlocked = (props) => (
  <Link {...props} onMouseDown={(e) => e.stopPropagation()} noScroll />
);
export default LinkBlocked;
