import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

import TaskEditModal from "./TaskEditModal";
import CreateTaskModal from "./CreateTaskModal";

import "../styles/index.css";

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      body
      isComplete
      createdAt
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateCompleteState($id: String!, $isComplete: Boolean!) {
    updateCompleteState(id: $id, isComplete: $isComplete) {
      id
      body
      isComplete
      createdAt
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: String!) {
    deleteTask(id: $id) {
      id
      body
      isComplete
      createdAt
    }
  }
`;

const TaskListPage = () => {
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isCreateTaskModalVisible, setCreateTaskModalVisible] = useState(false);

  // edit target
  const [id, setId] = useState("");
  const [body, setBody] = useState("");
  const [isComplete, setComplete] = useState(false);
  const [createdAt, setCreatedAt] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_TASKS);
  const [updateTaskState] = useMutation(UPDATE_TASK, {
    onCompleted() {
      refetch();
    },
  });
  const [deleteTask] = useMutation(DELETE_TASK, {
    onCompleted() {
      refetch();
    },
  });

  const showEditor = (id, body, isComplete, createdAt) => {
    // update edit target
    setId(id);
    setBody(body);
    setComplete(isComplete);
    setCreatedAt(createdAt);

    // update edit modal visible
    setEditModalVisible(true);
  };

  const changeCompleteState = (id, isComplete) => {
    updateTaskState({
      variables: {
        id: String(id),
        isComplete: isComplete,
      },
    });
  };

  const handleDeleteTask = (id) => {
    deleteTask({
      variables: {
        id,
      },
    });
  };

  /* view */

  if (loading) return "<p>ロード中</p>";
  if (error) return "<p>エラー</p>";

  return (
    <div>
      <h1>タスク一覧</h1>
      <div>
        {data.tasks.map((task, index) => {
          return (
            <div key={index}>
              <p>{task.id}</p>
              <p>{task.body}</p>
              <p>{task.isComplete}</p>
              <p>{task.createdAt}</p>
              <button
                onClick={() => {
                  showEditor(
                    task.id,
                    task.body,
                    task.isComplete,
                    task.createdAt
                  );
                }}
              >
                編集
              </button>
              <button
                onClick={() => {
                  changeCompleteState(task.id, !task.isComplete);
                }}
              >
                {task.isComplete ? "未達成に戻す" : "達成"}
              </button>
              <button onClick={() => handleDeleteTask(task.id)}>削除</button>
            </div>
          );
        })}
      </div>
      <button onClick={() => setCreateTaskModalVisible(true)}>
        タスク作成
      </button>
      {/* edit task modal */}
      <TaskEditModal
        isVisible={isEditModalVisible}
        setVisible={setEditModalVisible}
        id={id}
        body={body}
        isComplete={isComplete}
        createdAt={createdAt}
      />
      {/* create task modal */}
      <CreateTaskModal
        isVisible={isCreateTaskModalVisible}
        setVisible={setCreateTaskModalVisible}
        refetch={refetch}
      />
    </div>
  );
};

export default TaskListPage;
