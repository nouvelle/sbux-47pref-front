import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
// material-ui
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
// components
import Snshandle from '../../atoms/Snshandle/index';
import TwitterLink from '../../atoms/TwitterLink/index';
import ConfirmDialogCheckIn from '../../organisms/ConfirmDialogCheckIn/index';

import theme from '../../../theme';
import config from '../../../config';
import '../../../index.css'


const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    margin: 10
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  comment: {
    [theme.breakpoints.up('xs')]: {
      width: "90%",
    },
    [theme.breakpoints.up('sm')]: {
      width: "70%",
    },
    display: "block",
    margin: "0 auto",
    background: "white",
    padding: 20,
    boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  },
  media: {
    display: "block",
    width: "100%",
    paddingBottom: 20,
  },
  deleteButton: {
    width: 120,
    background: "#e53935",
    color: "#ffffff"
  },
  backdrop: {
    zIndex: '1500 !important',
  }
}));

const Post = () => {
  const [postData, setPostData] = useState();
  const [imgFromS3, setImgFromS3] = useState();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const { id } = useParams();

  useEffect(() => {
    const getData = async () => {
      const host = config[process.env.NODE_ENV].host;
      // 指定された投稿データを取得する
      const getPostUrl = (process.env.NODE_ENV === "production") ? host + "/posts" : "/posts";
      const url = `${getPostUrl}/${id}`;

      setLoading(true)
      return await fetch(url)
        .then(res => res.json())
        .then(data => {
          setPostData(data)
          return data
        })
        .then(async data => {
          if (data.image) {
            // 指定された画像を取得する
            const getImageUrl = (process.env.NODE_ENV === "production") ? `${host}/image/${data.image}` : `/image/${data.image}`;
            
            await fetch(getImageUrl)
              .then(res => res.json())
              .then(img => setImgFromS3(img.data))
              .catch(err => console.log(err))
          }
        })
        .catch(err => console.log(err))
        .finally(() => setLoading(false));
    }

    getData();
  }, [id]);
  
  // [削除] クリック時
  const handleDelete = async () => {
    setIsConfirmOpen(true);
  }

  return (
    <>
      <Container maxWidth="lg" className={classes.container}>
        {postData && imgFromS3
          ? (<div className={classes.comment}>
            <img
              className={classes.media} 
              src={`data:img/jpg;base64,${imgFromS3}`} 
              alt="post" 
            />
            <Typography variant="h6" component="div">#{postData.pref.id} {postData.pref.nameJP}</Typography>
            <Snshandle post={postData}/>
            {postData.comments
              ? <Typography style={{ wordWrap: 'break-word' }} variant="body1">{postData.comments}</Typography>
              : <></>
            }
            <CardActions id="iconWrap">
              <TwitterLink post={postData} />
              <Button variant="contained" onClick={handleDelete} className={`buttonItem ${classes.deleteButton}`}>削除</Button>
            </CardActions>
          </div>)
          : <></>
        }
      </Container>
      <ConfirmDialogCheckIn 
        isConfirmOpen={isConfirmOpen}
        setIsConfirmOpen={setIsConfirmOpen}
        setPostData={setPostData}
        postData={postData}
        setImgFromS3={setImgFromS3}
      />
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </>
  );
}

export default Post;
