import { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";

const UPDATE_TASK = gql`
  mutation UpdateQuestion($id: String!, $body: String!) {
    updateTaskBody(id: $id, body: $body) {
      id
      body
      isComplete
      createdAt
    }
  }
`;

const TaskEditModal = (props) => {
  const [bodyInputValue, setValue] = useState("");
  const [updateTaskBody] = useMutation(UPDATE_TASK, {
    onCompleted() {
      props.refetch();
    },
  });

  const closeModal = () => props.setVisible(false);
  const onUpdateBodyInput = (e) => setValue(e.target.value);

  const submitTask = () => {
    if (bodyInputValue.length === 0) {
      alert("タスクは1文字以上入力してください");
      return;
    }

    updateTaskBody({
      variables: {
        id: props.id,
        body: bodyInputValue,
      },
    });

    // close
    closeModal();
  };

  useEffect(() => {
    setValue(props.body);
  }, [props.body]);

  return (
    <>
      {props.isVisible ? (
        <div id="overlay" onClick={closeModal}>
          <div id="content" onClick={(e) => e.stopPropagation()}>
            <h2>タスク編集</h2>
            <div>
              <p>{props.id}</p>
              <input value={bodyInputValue} onChange={onUpdateBodyInput} />
              <p>{props.isComplete}</p>
              <p>{props.createdAt}</p>
            </div>
            <button onClick={closeModal}>close</button>
            <button onClick={submitTask}>更新</button>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default TaskEditModal;
