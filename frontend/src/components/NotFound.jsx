import { Link } from "react-router-dom/dist";

const NotFound = () => {
  return (
    <div>
      <h1>ページが見つかりませんでした 404</h1>
      <Link to="/">ホームに戻る</Link>
    </div>
  );
};

export default NotFound;
