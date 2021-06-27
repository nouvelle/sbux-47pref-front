import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
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
  const [imgSrc, setImgSrc] = useState("");
  const [imgName, setImgName] = useState("");
  const classes = useStyles();

  useEffect(() => {
    // const prefDataUrl = "/pref";
    // fetch(prefDataUrl).then(res => res.json())
    //   .then(data => setPrefList(data))
  }, []);

  // ポップアップの [削除] クリック時
  const handleDelete = () => {
    console.log("DELETE");
    props.setIsConfirmOpen(false);
  }
  
  // ポップアップの [CANCEL] クリック時
  const handleCancel = () => {
    console.log("CANCEL");
    props.setIsConfirmOpen(false);
  }

  return (
    <Dialog open={props.isConfirmOpen}>
      <DialogTitle id="alert-dialog-title">この投稿を削除しますか？</DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          {imgName ? <Typography variant="caption" display="block">ファイル名：{imgName}</Typography> : <></>}
          {imgSrc ? <div className="wrapPreview"><img className="preview" src={imgSrc} alt="preview" /></div> : <></>}
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
