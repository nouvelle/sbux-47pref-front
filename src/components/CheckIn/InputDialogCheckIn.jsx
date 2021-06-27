import 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import Compressor from 'compressorjs';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import DateFnsUtils from '@date-io/date-fns';
import Autocomplete from "@material-ui/lab/Autocomplete";
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
  errMsg: {
    color: "#e53935",
  },
}));

const createObjectURL = (window.URL || window.webkitURL).createObjectURL;

const InputDialog = (props) => {
  const [prefList, setPrefList] = useState([]);
  const [selectedPref, setSelectedPref] = useState(null);
  const [author, setAuthor] = useState("");
  const [secretkey, setSecretkey] = useState("");
  const [twitter, setTwitter] = useState("");
  const [inputText, setInputText] = useState("");
  const [formData, setFormData] = useState();
  const [imgSrc, setImgSrc] = useState("");
  const [imgName, setImgName] = useState("");
  const [now, setNow] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const inputRef = useRef();
  const classes = useStyles();

  useEffect(() => {
    const prefDataUrl = "/pref";
    fetch(prefDataUrl).then(res => res.json())
      .then(data => setPrefList(data))
  }, []);

  // 都道府県選択
  const handlePrefChange = (pref) => {
    const prefId = pref.target.getAttribute("data-option-index");
    setSelectedPref(prefList[prefId]);
  };
  
  // ニックネーム追加
  const handleNameChange = (e) => {
    setAuthor(e.target.value);
  };
  
  // シークレットキー追加
  const handleSecretkeyChange = (e) => {
    setSecretkey(e.target.value);
  };
  
  // Twitterハンドル名追加
  const handleTwitterChange = (e) => {
    setTwitter(e.target.value);
  };
  
  // コメント追加
  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  // 画像追加ボタンクリック時
  const handleClickUpload = () => {
    // 隠れたinput をクリックする
    inputRef.current.click()
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
        quality: 0.3,
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
    setAuthor("");
    setSecretkey("");
    setTwitter("");
    setInputText("");
    setImgSrc("");
    setFormData("");
    setImgName("");
    setNow(0);
    setErrMsg("");
    setSelectedPref(null);
    props.setOpen(false);
  }

  // ポップアップの [保存] クリック時
  const handleClose = async () => {
    if (!selectedPref) return setErrMsg("都道府県を選択してね！");
    if (!author) return setErrMsg("ニックネームを入力してね！");
    if (!imgName) return setErrMsg("画像をアップロードしてね！");
    
    // 店舗情報が存在する場合のみ保存を行う
    if(selectedPref) {
      // 画像データが設定されている時だけアップロード
      console.log("S3へのアップロード", selectedPref)
      const imgData = `${now}_${selectedPref["id"]}_${imgName}`;

      // S3へのアップロード
      const url = `/image?prefId=${selectedPref["id"]}&date=${now}&imgData=${imgData}`;
      console.log(url)
      console.log("imgName", imgName)
      console.log("formData", formData)
      await fetch(url, {
        method: 'POST',
        body: formData
      })
      .then((res) => console.log("成功", res))
      .catch(err => console.log("Err ", err))

      // 訪問記録を POST
      const postUrl = "/posts";
      await fetch(postUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "author": author,
          "secretkey": secretkey,
          "snshandle": twitter,
          "comments": inputText,
          "pref_id": selectedPref["id"],
          "image": imgData
        }) 
      })
      .then(res => res.json())
      .catch(err => console.log("Error :", err))
      
      // 店舗情報を再度取得し、再描画
      const getUrl = "/posts";
      let info = [];
      await fetch(getUrl)
        .then(res => res.json())
        .then(data => {
          console.log('data', data)
          info = data
          console.log('info', info)
        })
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
    }

    // state 初期化
    handleCancel()
  };

  // 都道府県選択のDOM
  const makePrefSelect = () => (
    <Autocomplete
      id="pref-select"
      options={prefList}
      getOptionLabel={(pref) => pref["nameJP"]}
      style={{ width: 120 }}
      renderInput={(params) => <TextField {...params} label="都道府県" />}
      onChange={handlePrefChange}
    />
  )

  return (
    <Dialog open={props.open}>
      <DialogTitle id="alert-dialog-title">あなたが飲んだフラペチーノの写真をアップしてね 😋</DialogTitle>
      <DialogContent>
        {errMsg
          ? <Typography variant="subtitle1" className={classes.errMsg}>{errMsg}</Typography>
          : <></>
        }
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <div id="selectStoreWrap">
            {makePrefSelect()}
          </div>
          <Typography variant="subtitle1" color="primary">{selectedPref ? selectedPref.drink : ''}</Typography>
          <TextField
            margin="dense"
            id="comment"
            label="ニックネーム"
            type="text"
            onChange={handleNameChange}
            fullWidth
          />
          <TextField
            margin="dense"
            id="comment"
            label="シークレットキー (任意)"
            type="text"
            onChange={handleSecretkeyChange}
            fullWidth
          />
          <TextField
            margin="dense"
            id="comment"
            label="Twitterハンドル名 (任意)"
            type="text"
            onChange={handleTwitterChange}
            fullWidth
          />
          <TextField
            margin="dense"
            id="comment"
            label="コメント (任意)"
            type="text"
            onChange={handleTextChange}
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
            ref={inputRef}
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
  );
}

export default InputDialog;
