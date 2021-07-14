import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
// material-ui
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
import { PrefListContext } from '../../../App';
import InputDialogPrefCheckIn from '../../organisms/InputDialogPrefCheckIn/index';
import InputDialogCheckIn from '../../organisms/InputDialogCheckIn/index';

import theme from '../../../theme';
import config from '../../../config';
import frap0 from '../../../assets/svg/frap0.svg';
import frap1 from '../../../assets/svg/frap1.svg';
import frap2 from '../../../assets/svg/frap2.svg';
import frap3 from '../../../assets/svg/frap3.svg';
import '../../../index.css'

const useStyles = makeStyles(() => ({
  root: {
    [theme.breakpoints.up('xs')]: {
      width: "48%",
    },
    [theme.breakpoints.up('sm')]: {
      width: "31%",
    },
    display: "flex",
    flexDirection: "column",
    margin: 3,
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  media: {
    width: '100%',
    height: 150,
  },
  progressWrap: {
    height: 150,
  },
  progress: {
    position: "absolute",
    top: "40%",
    left: "40%",
  },
  link: {
    textDecoration: "none",
  },
  noImgText: {
    position: "absolute",
    top: "12%",
    left: 0,
    fontSize: 24,
    color: "#333",
    transform: "rotate(-20deg)",
    zIndex: 2
  },
  mediaNo: {
    height: 150,
    backgroundSize: "55%",
    top: 10,
    position: "relative",
  },
  content: {
    padding: "5px !important",
  },
  count: {
    fontSize: 12,
    color: "#333",
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
}));

const PrefList = () => {
  const [selectedPref, setSelectedPref] = useState();
  const [open, setOpen] = useState(false)
  const [openPref, setOpenPref] = useState(false)
  const [loading, setLoading] = useState(false);
  const { isNeedGetLatestImageList, setIsNeedGetLatestImageList, prefList, setPrefList, imgFromS3, setImgFromS3 } = useContext(PrefListContext);
  const classes = useStyles();

  useEffect(() => {
    const getData = async () => {
      const host = config[process.env.NODE_ENV].host;
      const prefDataUrl = (process.env.NODE_ENV === "production") ? host + "/pref/post/num" : "/pref/post/num";
      setLoading(true)
      await fetch(prefDataUrl)
        .then(res => res.json())
        .then(data => setPrefList(data))
        .finally(() => setLoading(false));
    }

    getData();
  }, []);

  useEffect(() => {
    const getImg = async () => {
      if (!prefList) return;
      
      let newObj = {};

      const host = config[process.env.NODE_ENV].host;
      const getImgUrl = "/image";
        // 画像データをS3から取得する
        if (isNeedGetLatestImageList.state === "all") {
          for (const pref of prefList) {
            if (pref.posts_num > 0) {
              // 投稿データの中で最新の updated_at を取得
              const maxUnixTime = Math.max.apply(null, pref.posts.map((post) => new Date(post.updated_at)));
              const latestData = pref.posts.filter((post) => new Date(post.updated_at).getTime() === maxUnixTime);
              // 画像リストにある画像を取得
              const url = (process.env.NODE_ENV === "production") ? `${host}${getImgUrl}/${latestData[0].image}` : `${getImgUrl}/${latestData[0].image}`;
              fetch(url)
                .then(res => res.json())
                .then(img => img.data)
                // eslint-disable-next-line no-loop-func
                .then(data => {
                  newObj = { ...newObj, [pref.id] : { img: data, file: pref.posts[0].image } };
                  setImgFromS3(newObj);
                })
                .catch(err => console.log(err))
            }
          }
        } else if (isNeedGetLatestImageList.state === "add") {
          console.log("ADD: isNeedGetLatestImageList.pref", isNeedGetLatestImageList.pref)
          const url = (process.env.NODE_ENV === "production") ? `${host}${getImgUrl}/${isNeedGetLatestImageList.image}` : `${getImgUrl}/${isNeedGetLatestImageList.image}`;
          const base64Img = await fetch(url)
            .then(res => res.json())
            .then(img => img.data)
            .catch(err => console.log(err))
            setImgFromS3({ ...imgFromS3, [prefList[isNeedGetLatestImageList.pref - 1]['id']] : { img: base64Img, file: isNeedGetLatestImageList.image }});
        } else if (isNeedGetLatestImageList.state === "del") {
          console.log("DEL: isNeedGetLatestImageList.pref", isNeedGetLatestImageList.pref)
          const prefDataUrl = (process.env.NODE_ENV === "production") ? host + `/pref/${isNeedGetLatestImageList.pref}` : `/pref/${isNeedGetLatestImageList.pref}`;
          setLoading(true)
          const delPrefData = await fetch(prefDataUrl)
            .then(res => res.json())
            .finally(() => setLoading(false));
          
          // 投稿データの中で最新の updated_at を取得
          const maxUnixTime = Math.max.apply(null, delPrefData.posts.map((post) => new Date(post.updated_at)));
          const latestData = delPrefData.posts.filter((post) => new Date(post.updated_at).getTime() === maxUnixTime);
          console.log("latestData", latestData)

          if (latestData.length > 0) {
            console.log("yes")
            const url = (process.env.NODE_ENV === "production") ? `${host}${getImgUrl}/${latestData[0].image}` : `${getImgUrl}/${latestData[0].image}`;
            const base64Img = await fetch(url)
              .then(res => res.json())
              .then(img => img.data)
              .catch(err => console.log(err))
            setImgFromS3({ ...imgFromS3, [isNeedGetLatestImageList.pref] : { img: base64Img, file: latestData[0].image }});
          } else {
            console.log("no")
          }
        }
        setIsNeedGetLatestImageList({ state: "done", pref: "", image: "" })
      
    }

    getImg();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefList]);

  const postedPrefCard = (pref) => {
    if (imgFromS3[pref.id] && imgFromS3[pref.id]['img']) {
      return (<Link to={`/pref/${pref.id}`}>
        <CardMedia
          className={classes.media}
          image={`data:img/jpg;base64,${imgFromS3[pref.id]['img']}`}
          title={pref.drink}
        />
      </Link>)
    } else {
      return (<Link to={`/pref/${pref.id}`}>
        <div className={classes.progressWrap}>
          <CircularProgress className={classes.progress} color="secondary" />
        </div>
      </Link>)
    }
  }

  const handleAddPost = (pref) => {
    setSelectedPref(pref)
    setOpenPref(true)
  }
  
  return (
    <>
    <Button className={classes.addBtn} variant="outlined" onClick={() => setOpen(true)}><AddIcon /></Button>
    <Container maxWidth="lg" className={classes.container}>
      {prefList && prefList.length > 0
        ? prefList.map(pref => {
          const imgId = Math.floor(pref.id % 4);
          return (<Card key={pref.id} className={classes.root}>
            <CardActionArea>
              {pref.is_post 
                ? <>{postedPrefCard(pref)}</>
                :  (<div onClick={() => handleAddPost(pref)} className={classes.link}>
                      <Typography variant="body2" color="textSecondary" className={classes.noImgText}>Please Post!</Typography>
                      {imgId === 0 
                        ? <CardMedia className={classes.mediaNo} image={frap0} title={pref.name} />
                        : imgId === 1
                          ? <CardMedia className={classes.mediaNo} image={frap1} title={pref.name} />
                          : imgId === 2
                            ? <CardMedia className={classes.mediaNo} image={frap2} title={pref.name} />
                            : <CardMedia className={classes.mediaNo} image={frap3} title={pref.name} />
                      }
                    </div>)
              }
            </CardActionArea>
            <CardContent className={classes.content}>
              <div variant="button" component="div">#{pref.id} {pref.nameJP} <span className={classes.count}>{`(${pref.posts_num}件)`}</span></div>
            </CardContent>
          </Card>)
        })
        : <></>
      }
      <InputDialogPrefCheckIn 
        open={openPref}
        setOpen={setOpenPref}
        setSelectedPref={setSelectedPref}
        selectedPref={selectedPref}
        // setPrefList={setPrefList}
      />
      <InputDialogCheckIn 
        open={open}
        setOpen={setOpen}
        setSelectedPref={setSelectedPref}
        // setPostData={setPostData}
        // setImgFromS3={setImgFromS3}
        // setHasMore={setHasMore}
        // setOffset={setOffset}
      />
      </Container>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </>
  );
}

export default PrefList;
