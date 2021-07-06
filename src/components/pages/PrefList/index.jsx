import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
// material-ui
import Backdrop from '@material-ui/core/Backdrop';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
// components
import InputDialogPrefCheckIn from '../../organisms/InputDialogPrefCheckIn/index';

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
  }
}));

const PrefList = () => {
  const [prefList, setPrefList] = useState();
  const [selectedPref, setSelectedPref] = useState();
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imgFromS3, setImgFromS3] = useState({})
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
      for (const pref of prefList) {
        if (pref.posts_num > 0) {
          // 投稿データの中で最新の updated_at を取得
          const maxUnixTime = Math.max.apply(null, pref.posts.map((post) => new Date(post.updated_at)));
          const latestData = pref.posts.filter((post) => new Date(post.updated_at).getTime() === maxUnixTime);
          
          // 画像データをS3から取得する
          if (Object.keys(imgFromS3).length === 0 && latestData[0].image) {
            // 画像リストにある画像を取得
            const host = config[process.env.NODE_ENV].host;
            const getImgUrl = "/image";
            const url = (process.env.NODE_ENV === "production") ? `${host}${getImgUrl}/${latestData[0].image}` : `${getImgUrl}/${latestData[0].image}`;
            const base64Img = await fetch(url)
              .then(res => res.json())
              .then(img => img.data)
              .catch(err => console.log(err))
            
            newObj = { ...newObj, [pref.id] : base64Img };
          }
        }
      }
      setImgFromS3(newObj);
      setLoaded(true);
    }
    getImg();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefList]);

  const handleAddPost = (pref) => {
    setSelectedPref(pref)
    setOpen(true)
  }
  
  return (
    <>
    <Container maxWidth="lg" className={classes.container}>
      {prefList && prefList.length > 0
        ? prefList.map(pref => {
          const imgId = Math.floor(pref.id % 4);
          return (<Card key={pref.id} className={classes.root}>
            <CardActionArea>
              {pref.is_post 
                ? <>
                  {loaded 
                    ? (<Link to={`/pref/${pref.id}`}>
                      <CardMedia
                        className={classes.media}
                        image={`data:img/jpg;base64,${imgFromS3[pref.id]}`}
                        title={pref.drink}
                      />
                    </Link>)
                    : (<Link to={`/pref/${pref.id}`}>
                        <div className={classes.progressWrap}>
                          <CircularProgress className={classes.progress} color="secondary" />
                        </div>
                      </Link>)}
                </>
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
        open={open}
        setOpen={setOpen}
        setSelectedPref={setSelectedPref}
        selectedPref={selectedPref}
        setPrefList={setPrefList}
      />
      </Container>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </>
  );
}

export default PrefList;
