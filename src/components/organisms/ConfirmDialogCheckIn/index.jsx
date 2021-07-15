import React, { useState, useRef, useEffect, useContext } from 'react';
import { withRouter } from "react-router-dom";
// material-ui
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { DataContext } from '../../../App';
import config from '../../../config';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: 330,
  },
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
  errMsg: {
    color: "#e53935",
  },
  deleteButton: {
    color: "#e53935",
  },
  backdrop: {
    zIndex: '1500 !important',
  }
}));

const ConfirmDialogCheckIn = withRouter((props) => {
  const [loading, setLoading] = useState(false);
  const [isSecretKey, setIsSecretKey] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const { setIsNeedGetLatestImageList } = useContext(DataContext);
  const inputSecretkeyRef = useRef();
  const classes = useStyles();

  useEffect(() => {
    const keyCheck = async () => {
      const host = config[process.env.NODE_ENV].host;
      const keyCheckUrl = (process.env.NODE_ENV === "production") ? host + `/posts/${props.postData.id}/keyCheck` : `/posts/${props.postData.id}/keyCheck`;
  
      // 指定した投稿IDがシークレットキーを持っているかどうかチェックする
      setLoading(true);
      const isKey = await fetch(keyCheckUrl)
      .then(res => res.json())
      .catch(err => console.log("Error :", err))
      .finally(() => setLoading(false));
      
      // シークレットキーを持っているかどうか(持っている: true, 持っていない: false)
      setIsSecretKey(isKey.result);
    }

    if (props.postData) {
      keyCheck();
    }
  }, [props.postData]);

  // ポップアップの [削除] クリック時
  const handleDelete = async () => {
    const host = config[process.env.NODE_ENV].host;

    // シークレットキーの確認(シークレットキーを持っている: true)
    if (isSecretKey) {
      const secretkey = inputSecretkeyRef.current.value;
      if (!secretkey) return setErrMsg("シークレットキを入力してね！");

      const keyCheckUrl = (process.env.NODE_ENV === "production") ? host + `/posts/${props.postData.id}/keyCheck` : `/posts/${props.postData.id}/keyCheck`;

      // 指定した投稿IDのシークレットキーが正しいかどうかをチェックする
      setLoading(true);
      const isKeyCorrect = await fetch(keyCheckUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "key": secretkey
        }) 
      })
      .then(res => res.json())
      .catch(err => console.log("Error :", err))
      .finally(() => setLoading(false));
      
      if (!isKeyCorrect.result) return setErrMsg("シークレットキーが正しくありません。");
    }

    // 選択された画像をS3から削除
    const deleteUrlS3 = (process.env.NODE_ENV === "production") ? host + "/image" : "/image";
    
    setLoading(true);
    await fetch(deleteUrlS3, {
      method: 'DELETE',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "imgData": props.postData.image
      }) 
    })
    .then(res => res.json())
    .then(() => setIsNeedGetLatestImageList({ state: "del", pref: props.postData.pref.id, image: "" }))
    .catch(err => console.log("Error :", err))
    .finally(() => setLoading(false));

    // 選択された投稿をDBから削除
    const deleteUrlDB = (process.env.NODE_ENV === "production") ? `${host}/posts/${props.postData.id}` : `/posts/${props.postData.id}`;
    
    setLoading(true);
    await fetch(deleteUrlDB, {
      method: 'DELETE',
      mode: 'cors',
    })
    .then(res => res.json())
    .catch(err => console.log("Error :", err))
    .finally(() => {
      setLoading(false)
      
      // 前のページに戻る
      props.history.goBack()
    });
  }
  
  // ポップアップの [CANCEL] クリック時
  const handleCancel = () => {
    setErrMsg("");
    props.setIsConfirmOpen(false);
  }

  return (
    <>
      <Dialog open={props.isConfirmOpen}>
        <DialogTitle id="alert-dialog-title">この投稿を削除しますか？</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {errMsg
            ? <Typography variant="subtitle1" className={classes.errMsg}>{errMsg}</Typography>
            : <></>
          }
          {isSecretKey
            ? (<TextField
                margin="dense"
                id="twitter"
                label="シークレットキーを入力してください"
                type="text"
                inputRef={inputSecretkeyRef}
                inputProps={{ maxLength: 15 }}
                fullWidth
              />)
            : <></>
          }
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">CANCEL</Button>
          <Button onClick={handleDelete} className={classes.deleteButton}>削除</Button>
        </DialogActions>
      </Dialog>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </>
  );
});

export default ConfirmDialogCheckIn;
