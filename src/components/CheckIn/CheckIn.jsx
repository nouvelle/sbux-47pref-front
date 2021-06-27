import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Link from '@material-ui/core/Link';
import TwitterIcon from '@material-ui/icons/Twitter';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import moment from 'moment';

import InputDialogCheckIn from './InputDialogCheckIn';
import theme from '../../theme';
import '../../index.css'

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
}));

const CheckIn = () => {
  const [PostData, setPostData] = useState([]);
  const [imgFromS3, setImgFromS3] = useState([])
  const [open, setOpen] = useState(false)
  const classes = useStyles();

  useEffect(() => {
    const getImgFromS3 = async () => {
      const url = "/posts";
      let info = [];
      await fetch(url)
        .then(res => res.json())
        .then(data => {
          setPostData(data);
          info = data;
        })
  
      const getImgUrl = "/image";
      // 画像リストにある画像を取得
      if(info.length > 0) {
        const base64Arr = await Promise.all(
          info.map((data) => {
            if(data.image) {
              const url = `${getImgUrl}/${data.image}`;
              return fetch(url)
                .then(res => res.json())
                .then(img => img.data)
                .catch(err => console.log(err))
            } else {
              return "";
            }
          })
        );
        setImgFromS3(base64Arr);
      }
    }
    getImgFromS3();
  }, []);

  return (
    <>
      <Container maxWidth="lg" className={classes.container}>
        <Button id="checkinAdd" variant="outlined" onClick={() => setOpen(true)}><AddIcon /></Button>
        <div className="wrapCard">
          {PostData.length > 0
            ? PostData.map((post, id) => {
              return (<Card key={id} className={classes.root}>
                <CardActionArea>
                  {imgFromS3 && imgFromS3[id]
                    ? (<Link href={`/post/${post.id}`}>
                        <CardMedia
                          className={classes.media}
                          image={`data:img/jpg;base64,${imgFromS3[id]}`}
                          title={post["image"]}
                          // onClick={(e) => handleClickCard(e, post)}
                        />
                      </Link>)
                    : <></>
                  }
                </CardActionArea>
                <CardContent>
                  <Typography variant="button" component="div">#{post.id} {post.pref.nameJP}</Typography>
                  <Typography variant="body2" color="textSecondary" component="div">{moment(post.updated_at).format('YYYY/MM/DD ddd HH:mm')} by {post.author}</Typography>
                  {post.comments
                    ? <Typography style={{ wordWrap: 'break-word' }} variant="body2">{post.comments}</Typography>
                    : <></>
                  }
                </CardContent>
                <CardActions disableSpacing>
                  <IconButton aria-label="share">
                    <Link href="https://twitter.com/share?url=https://koeri.surge.sh/&text=47pref&hashtags=47pref" target="_about"><ShareIcon /></Link>
                  </IconButton>
                  {post.snshandle
                    ? <IconButton aria-label="twitter">
                        <Link href={"https://twitter.com/" + post.snshandle} target="_about" ><TwitterIcon style={{ color: "#1DA1F2" }} /></Link>
                      </IconButton>
                    : <></>
                  }
                </CardActions>
              </Card>)
            }) : <></>
          }
        </div>
      </Container>
      <InputDialogCheckIn 
        open={open}
        setOpen={setOpen}
        setPostData={setPostData}
        setImgFromS3={setImgFromS3}
      />
    </>
  );
}

export default CheckIn;
