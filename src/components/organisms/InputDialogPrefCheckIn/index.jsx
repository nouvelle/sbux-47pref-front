import 'date-fns';
import React, { useState, useRef, useContext } from 'react';
import Compressor from 'compressorjs';
import DateFnsUtils from '@date-io/date-fns';
// material-ui
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CircularProgress from '@material-ui/core/CircularProgress';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { DataContext } from '../../../App';
import config from '../../../config';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  errMsg: {
    color: "#e53935",
  },
  backdrop: {
    zIndex: '1500 !important',
  },
  drinkName: {
    color: theme.palette.secondary.light,
  }
}));

const createObjectURL = (window.URL || window.webkitURL).createObjectURL;

const InputDialogPrefCheckIn = (props) => {
  const [formData, setFormData] = useState();
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgName, setImgName] = useState("");
  const [now, setNow] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const { setIsNeedGetLatestImageList, setPrefList } = useContext(DataContext);
  const inputImgRef = useRef();
  const inputAuthorRef = useRef();
  const inputSecretkeyRef = useRef();
  const inputTwitterRef = useRef();
  const inputCommentRef = useRef();
  const classes = useStyles();
  
  // 画像追加ボタンクリック時
  const handleClickUpload = () => {
    // 隠れたinput をクリックする
    inputImgRef.current.click()
  }

  // 画像取り消しボタンクリック時
  const handleClearUploadImg = () => {
    setImgSrc("");
    setFormData("");
    setImgName("");
  }

  // inputでファイル選択
  const handleChange = (e) => {
    // React v17.0 から e.persist() を使わなくてもイベントのプロパティにアクセスできるようになった
    // 写真が設定されている時だけ
    if(e.target.files.length > 0) {
      const file = e.target.files[0];

      // 画面表示用のファイル名称をセット
      setImgName(file.name)

      // compressorjs を使って、画像ファイルを圧縮
      new Compressor(file, {
        quality: 0.25,
        success(result) {
          // プレビュー用の画像を設定
          const imgSrc = createObjectURL(result);
          setImgSrc(imgSrc);
      
          // 送信データの準備
          const formData = new FormData();
          formData.append("file", result, file.name);
          setFormData(formData);
    
          // 画像名に付けたタイムスタンプ
          setNow(Date.now())
        },
        error(err) {
          console.log("圧縮失敗 :", err)
        }
      })
      
    }
  }

  // ポップアップの [CANCEL] クリック時
  const handleCancel = () => {
    // state 初期化して、ポップアップをクローズ
    setImgSrc("");
    setFormData("");
    setImgName("");
    setNow(0);
    setErrMsg("");
    props.setSelectedPref(null);
    props.setOpen(false);
  }

  // ポップアップの [保存] クリック時
  const handleClose = async () => {
    const host = config[process.env.NODE_ENV].host;
    const author = inputAuthorRef.current.value;
    const secretkey = inputSecretkeyRef.current.value;
    const twitter = inputTwitterRef.current.value;
    const inputText = inputCommentRef.current.value;

    if (!author) return setErrMsg("ニックネームを入力してね！");
    if (!imgName) return setErrMsg("画像をアップロードしてね！");
    
    // 画像データが設定されている時だけアップロード
    const imgData = `${now}_${props.selectedPref.id}_${imgName}`;

    // S3へのアップロード
    const url = (process.env.NODE_ENV === "production") ? `${host}/image?prefId=${props.selectedPref.id}&date=${now}&imgData=${imgData}` : `/image?prefId=${props.selectedPref.id}&date=${now}&imgData=${imgData}`;
    
    setLoading(true);
    await fetch(url, {
      method: 'POST',
      body: formData
    })
    // .then((res) => console.log("成功", res))
    .catch(err => console.log("Err ", err))
    .finally(() => setLoading(false));

    // 訪問記録を POST
    const postUrl = (process.env.NODE_ENV === "production") ? host + "/posts" : "/posts";
    
    // 都道府県の投稿情報を再度取得し、再描画
    const prefDataUrl = (process.env.NODE_ENV === "production") ? host + "/pref/post/num" : "/pref/post/num";

    setLoading(true);
    // 訪問記録を POST
    await fetch(postUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "author": author,
        "secretkey": secretkey,
        "snshandle": twitter,
        "comments": inputText,
        "pref_id": props.selectedPref.id,
        "image": imgData
      }) 
    })
    .then(() => setIsNeedGetLatestImageList({ state: "add", pref: props.selectedPref.id, image: imgData }))
    // 店舗情報を再度取得し、再描画(S3から画像を取得する処理含む)
    .then(() => fetch(prefDataUrl))
    .then(res => res.json())
    .then(data => setPrefList(data))
    .catch(err => console.log("err :", err))
    .finally(() => {
      setLoading(false)
      
      // state 初期化
      handleCancel()
    });

  };

  return (
    <>
      <Dialog open={props.open}>
        <DialogTitle id="alert-dialog-title">あなたが飲んだフラペチーノの写真をアップしてね 😋</DialogTitle>
        <DialogContent>
          {errMsg
            ? <Typography variant="subtitle1" className={classes.errMsg}>{errMsg}</Typography>
            : <></>
          }
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Typography variant="subtitle1" className={classes.drinkName}>{props.selectedPref ? props.selectedPref.drink : ''}</Typography>
            <TextField
              margin="dense"
              id="author1"
              label="ニックネーム (10文字まで)"
              type="text"
              inputRef={inputAuthorRef}
              inputProps={{ maxLength: 10 }}
              fullWidth
            />
            <TextField
              margin="dense"
              id="secretKey1"
              label="シークレットキー (任意・10文字まで)"
              type="text"
              inputRef={inputSecretkeyRef}
              inputProps={{ maxLength: 10 }}
              fullWidth
            />
            <Typography variant="caption" color="textSecondary">※ 画像削除時に使用します</Typography>
            <TextField
              margin="dense"
              id="twitter1"
              label="Twitterハンドル名 (任意)"
              type="text"
              inputRef={inputTwitterRef}
              inputProps={{ maxLength: 15 }}
              fullWidth
            />
            <Typography variant="caption" color="textSecondary">※ 入力いただければ Twitterページへのリンクを追加します</Typography>
            <TextField
              margin="dense"
              id="comment1"
              label="コメント (任意・100文字まで)"
              type="text"
              inputRef={inputCommentRef}
              inputProps={{ maxLength: 100 }}
              fullWidth
            />
            <Button
              variant="outlined"
              color="secondary"
              className={classes.button}
              startIcon={<CloudUploadIcon />}
              onClick={handleClickUpload}
            >画像追加</Button>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.button}
              startIcon={<DeleteIcon />}
              onClick={handleClearUploadImg}
            >画像取消</Button>
            <input
              type="file"
              ref={inputImgRef}
              onChange={handleChange}
              style={{ display: 'none' }}
              accept="image/*"
              name="storeImage"
            />
            {imgName ? <Typography variant="caption" display="block">ファイル名：{imgName}</Typography> : <></>}
            {imgSrc ? <div className="wrapPreview"><img className="preview" src={imgSrc} alt="preview" /></div> : <></>}
          </MuiPickersUtilsProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">CANCEL</Button>
          <Button onClick={handleClose} color="secondary">保存</Button>
        </DialogActions>
      </Dialog>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </>
  );
}

export default InputDialogPrefCheckIn;
