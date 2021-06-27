import React from 'react';
import { withRouter } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import config from '../../config';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minWidth: 120,
  },
  deleteButton: {
    color: "#e53935",
  },
}));

const ConfirmDialogCheckIn= withRouter((props) => {
  const classes = useStyles();

  // ポップアップの [削除] クリック時
  const handleDelete = async () => {
    const host = config[process.env.NODE_ENV].host;
    // 選択された画像をS3から削除
    const deleteUrlS3 = (process.env.NODE_ENV === "production") ? host + "/image" : "/image";
    await fetch(deleteUrlS3, {
      method: 'DELETE',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "imgData": props.postData.image
      }) 
    })
    .then(res => res.json())
    .catch(err => console.log("Error :", err))

    // 選択された投稿をDBから削除
    const deleteUrlDB = (process.env.NODE_ENV === "production") ? `${host}/posts/${props.postData.id}` : `/posts/${props.postData.id}`;
    await fetch(deleteUrlDB, {
      method: 'DELETE',
      mode: 'cors',
    })
    .then(res => res.json())
    .catch(err => console.log("Error :", err))

    // トップに戻る
    props.history.push("/")
  }
  
  // ポップアップの [CANCEL] クリック時
  const handleCancel = () => {
    props.setIsConfirmOpen(false);
  }

  return (
    <Dialog open={props.isConfirmOpen}>
      <DialogTitle id="alert-dialog-title">この投稿を削除しますか？</DialogTitle>
      <DialogContent>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">CANCEL</Button>
        <Button onClick={handleDelete} className={classes.deleteButton}>削除</Button>
      </DialogActions>
    </Dialog>
  );
});

export default ConfirmDialogCheckIn;
