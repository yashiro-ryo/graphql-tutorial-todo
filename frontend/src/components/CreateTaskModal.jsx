import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

const CREATE_TASK = gql`
  mutation CreateTask($body: String!) {
    createTask(body: $body) {
      id
      body
      isComplete
      createdAt
    }
  }
`;

const CreateTaskModal = (props) => {
  const [bodyInputValue, setValue] = useState("");

  const [createTask] = useMutation(CREATE_TASK, {
    onCompleted() {
      props.refetch();
    },
  });

  const closeModal = () => props.setVisible(false);
  const onUpdateBodyInput = (e) => setValue(e.target.value);

  const submitTask = () => {
    if (bodyInputValue.length < 1) {
      alert("タスクは1文字以上入力してください");
      return;
    }

    createTask({
      variables: {
        body: bodyInputValue,
      },
    });

    closeModal();
    setValue("");
  };

  return (
    <>
      {props.isVisible ? (
        <div id="overlay" onClick={closeModal}>
          <div id="content" onClick={(e) => e.stopPropagation()}>
            <h2>タスク作成</h2>
            <div>
              <input value={bodyInputValue} onChange={onUpdateBodyInput} />
            </div>
            <button onClick={closeModal}>close</button>
            <button onClick={submitTask}>作成</button>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default CreateTaskModal;
