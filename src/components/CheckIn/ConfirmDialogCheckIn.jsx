import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

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

const ConfirmDialogCheckIn= (props) => {
  const classes = useStyles();
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (props.slectedPost) {
      // 指定された画像を取得する
      const getImgUrl = "/image";
      const url = `${getImgUrl}/${props.slectedPost.image}`;
      return fetch(url)
        .then(res => res.json())
        .then(img => setSelectedImage(img.data))
        .catch(err => console.log(err))
    }
  }, [props.slectedPost]);

  // ポップアップの [削除] クリック時
  const handleDelete = async () => {
    console.log("DELETE", props.slectedPost);

    // 選択された画像をS3から削除
    const deleteUrlS3 = "/image";
    await fetch(deleteUrlS3, {
      method: 'DELETE',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "imgData": props.slectedPost.image
      }) 
    })
    .then(res => res.json())
    .catch(err => console.log("Error :", err))

    // 選択された投稿をDBから削除
    const deleteUrlDB = `/posts/${props.slectedPost.id}`;
    await fetch(deleteUrlDB, {
      method: 'DELETE',
      mode: 'cors',
    })
    .then(res => res.json())
    .catch(err => console.log("Error :", err))

    // 店舗情報を再度取得し、再描画
    const getUrl = "/posts";
    let info = [];
    await fetch(getUrl)
      .then(res => res.json())
      .then(data => info = data)
      .catch(err => console.log("err :", err));

    // アップロード後、画像リストにある画像を再度S3から画像を取得
    const getImgUrl = "/image/";
    if(info.length > 0){
      const base64Arr = await Promise.all(
        info.map((data) => {
          if(data.image) {
            return fetch(getImgUrl + data.image)
              .then(res => res.json())
              .then(img => img.data)
          } else {
            return "";
          }
        })
      );
      // アップロード後に再度S3から画像を取得後、画面を再描画する。
      props.setImgFromS3(base64Arr);
      props.setPostData(info);
    }
    
    props.setIsConfirmOpen(false);
  }
  
  // ポップアップの [CANCEL] クリック時
  const handleCancel = () => {
    console.log("CANCEL");
    props.setSlectedPost("");
    props.setIsConfirmOpen(false);
  }

  return (
    <Dialog open={props.isConfirmOpen}>
      <DialogTitle id="alert-dialog-title">この投稿を削除しますか？</DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {selectedImage ? <div className="wrapPreview"><img className="preview" src={`data:img/jpg;base64,${selectedImage}`} alt="preview" /></div> : <></>}
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">CANCEL</Button>
        <Button onClick={handleDelete} className={classes.deleteButton}>削除</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialogCheckIn;
