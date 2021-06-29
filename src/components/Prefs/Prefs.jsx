import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import theme from '../../theme';
import config from '../../config';
import frap0 from '../../assets/svg/frap0.svg';
import frap1 from '../../assets/svg/frap1.svg';
import frap2 from '../../assets/svg/frap2.svg';
import frap3 from '../../assets/svg/frap3.svg';
import '../../index.css'

import InputDialogPrefCheckIn from '../CheckIn/InputDialogPrefCheckIn';

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
    height: 150,
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
  backdrop: {
    zIndex: '1500 !important',
  }
}));

const Prefs = () => {
  const [prefList, setPrefList] = useState();
  const [selectedPref, setSelectedPref] = useState();
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const getData = async () => {
      const host = config[process.env.NODE_ENV].host;
      const prefDataUrl = (process.env.NODE_ENV === "production") ? host + "/pref/post/latest" : "/pref/post/latest";
      setLoading(true)
      await fetch(prefDataUrl)
        .then(res => res.json())
        .then(data => setPrefList(data))
        .finally(() => setLoading(false));
    }

    getData();
  }, []);

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
                    ? (<Link to={`/pref/${pref.id}`}>
                        <CardMedia
                          className={classes.media}
                          image={`data:img/jpg;base64,${pref.s3Image.data}`}
                          title={pref.drink}
                        />
                      </Link>)
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
                  <div variant="button" component="div">#{pref.id} {pref.nameJP}</div>
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

export default Prefs;
