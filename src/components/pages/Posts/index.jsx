import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
// material-ui
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
// components
import Snshandle from '../../atoms/Snshandle/index';
import InputDialogCheckIn from '../../organisms/InputDialogCheckIn/index';

import theme from '../../../theme';
import config from '../../../config';
import '../../../index.css'

const useStyles = makeStyles(() => ({
  root: {
    [theme.breakpoints.up('xs')]: {
      width: "100%",
      margin: 10
    },
    [theme.breakpoints.up('sm')]: {
      width: "31%",
      margin: "1%"
    },
    display: "flex",
    flexDirection: "column",
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  media: {
    height: 300,
  },
  progressWrap: {
    height: 150,
  },
  progress: {
    position: "absolute",
    top: "40%",
    left: "40%",
  },
  norFound: {
    height: 300,
    background: theme.palette.primary.main,
    textAlign: "center",
    lineHeight: "200px",
  },
  backdrop: {
    zIndex: '1500 !important',
  },
  addBtn: {  
    width: 60,
    height: 60,
    margin: "20px auto",
    display: "flex",
    position: "fixed",
    right: 10,
    bottom: 0,
    borderRadius: 50,
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    zIndex: 3,
  },
  footer: {
    marginTop: 24,
    marginBottom: 35,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  footerBtn: {
    width: "80%"
  }
}));

const Posts = () => {
  const [postData, setPostData] = useState([]);
  const [imgFromS3, setImgFromS3] = useState({})
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const classes = useStyles();

  // 投稿データ取得
  const getImgFromS3 = async () => {
    if (hasMore) {
      const host = config[process.env.NODE_ENV].host
      const url = (process.env.NODE_ENV === "production") ? host + "/posts" : "/posts";
      let postInfo = [];
  
      setLoading(true)
      const posts = await fetch(`${url}?offset=${offset}`)
        .then(res => res.json())
        .then(data => data);
      postInfo = posts.data;
      
      setPostData([...postData, ...posts.data]);
      setHasMore(posts.has_more);
      setOffset(offset + 9);
      setLoading(false)
  
      const getImgUrl = "/image";
      let newImgObj = {};

      // 画像リストにある画像を取得
      if(postInfo.length > 0) {
        setImgLoading(true)
        for (const post of postInfo) {
          if(post.image) {
            const url = (process.env.NODE_ENV === "production") ? `${host}${getImgUrl}/${post.image}` : `${getImgUrl}/${post.image}`;
            fetch(url)
              .then(res => res.json())
              // eslint-disable-next-line no-loop-func
              .then(img => {
                newImgObj = { ...imgFromS3, ...newImgObj, [post.id] : { img: img.data } };
                setImgFromS3(newImgObj)
              })
              .catch(err => console.log(err));
          }
        }
      }
    }
  }

  useEffect(() => {
    getImgFromS3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // もっとみるボタンが押された時
  const doLoadMorePost = () => {
    getImgFromS3()
  }

  return (
    <>
      <Container maxWidth="lg" className={classes.container}>
        <Button className={classes.addBtn} variant="outlined" onClick={() => setOpen(true)}><AddIcon /></Button>
        <div className="wrapCard">
          {postData.length > 0
            ? postData.map((post, id) => {
              return (<Card key={id} className={classes.root}>
                <CardActionArea>
                  {imgFromS3 && imgFromS3[post.id] 
                    ? imgFromS3[post.id]["img"]
                      ? (<Link to={`/posts/${post.id}`}>
                          <CardMedia
                            className={classes.media}
                            image={`data:img/jpg;base64,${imgFromS3[post.id]["img"]}`}
                            title={post["image"]}
                          />
                        </Link>)
                      : <Typography className={classes.norFound}>画像が取得できませんでした</Typography>
                    : imgLoading
                      ? <div className={classes.progressWrap}>
                          <CircularProgress className={classes.progress} color="secondary" />
                        </div>
                      : <></>
                  }
                </CardActionArea>
                <CardContent>
                  <Typography variant="button" component="div">#{post.pref.id} {post.pref.name}</Typography>
                  <Snshandle post={post}/>
                  {post.comments
                    ? <Typography style={{ wordWrap: 'break-word' }} variant="body2">{post.comments}</Typography>
                    : <></>
                  }
                </CardContent>
              </Card>)
            }) : <></>
          }
        </div>
        <div className={classes.footer} >
          <Button
            disabled={!hasMore}
            size="large"
            className={classes.footerBtn}
            variant="contained"
            color="secondary"
            onClick={() => doLoadMorePost()}
          >もっとみる</Button>
        </div>
      </Container>
      <InputDialogCheckIn 
        open={open}
        setOpen={setOpen}
        setPostData={setPostData}
        // setImgFromS3={setImgFromS3}
        setHasMore={setHasMore}
        setOffset={setOffset}
      />
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </>
  );
}

export default Posts;
