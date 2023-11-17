import { Link } from "react-router-dom/dist";

const HomePage = () => {
  return (
    <div>
      <h1>GraphQLを使用したタスク管理アプリ</h1>
      <Link to="/tasks">タスク一覧へ</Link>
    </div>
  );
};

export default HomePage;
