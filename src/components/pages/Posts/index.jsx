import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import moment from 'moment';
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
  const [imgFromS3, setImgFromS3] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const classes = useStyles();

  // 投稿データ取得
  const getImgFromS3 = async () => {
    if (hasMore) {
      const host = config[process.env.NODE_ENV].host
      const url = (process.env.NODE_ENV === "production") ? host + "/posts" : "/posts";
      let info = [];
  
      setLoading(true)
      const posts = await fetch(`${url}?offset=${offset}`)
        .then(res => res.json())
        .then(data => data);
      info = posts.data;
      
      setPostData([...postData, ...posts.data]);
      setHasMore(posts.has_more);
      setOffset(offset + 9);
      setLoading(false)
  
      const getImgUrl = "/image";
      // 画像リストにある画像を取得
      if(info.length > 0) {
        setLoading(true)
        const base64Arr = await Promise.all(
          info.map((data) => {
            if(data.image) {
              const url = (process.env.NODE_ENV === "production") ? `${host}${getImgUrl}/${data.image}` : `${getImgUrl}/${data.image}`;
              return fetch(url)
                .then(res => res.json())
                .then(img => img.data)
                .catch(err => console.log(err))
            } else {
              return "";
            }
          })
        ).finally(() => setLoading(false));
        setImgFromS3([...imgFromS3, ...base64Arr]);
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
                  {imgFromS3 && imgFromS3[id]
                    ? (<Link to={`/posts/${post.id}`}>
                        <CardMedia
                          className={classes.media}
                          image={`data:img/jpg;base64,${imgFromS3[id]}`}
                          title={post["image"]}
                        />
                      </Link>)
                    : loading
                      ? <></>
                      : <Typography className={classes.norFound}>画像が取得できませんでした</Typography>
                  }
                </CardActionArea>
                <CardContent>
                  <Typography variant="button" component="div">#{post.pref.id} {post.pref.name}</Typography>
                  <Typography variant="body2" color="textSecondary" component="div">{moment(post.updated_at).format('YYYY/MM/DD ddd HH:mm')} by {post.author}</Typography>
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
        setImgFromS3={setImgFromS3}
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