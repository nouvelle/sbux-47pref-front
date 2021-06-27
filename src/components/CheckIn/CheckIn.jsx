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
import moment from 'moment';

import InputDialogCheckIn from './InputDialogCheckIn';
import ConfirmDialogCheckIn from './ConfirmDialogCheckIn';
import theme from '../../theme';
import '../../index.css'

const useStyles = makeStyles(() => ({
  root: {
    [theme.breakpoints.up('xs')]: {
      width: "100%",
      display: "flex",
      margin: 10
    },
    [theme.breakpoints.up('sm')]: {
      width: "31%",
      display: "flex",
      margin: "1%"
    },
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto'
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  media: {
    height: 200,
  },
}));

const CheckIn = () => {
  const [PostData, setPostData] = useState([]);
  const [imgFromS3, setImgFromS3] = useState([])
  const [open, setOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
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

  const handleClickCard = () => {
    console.log("click");
    setIsConfirmOpen(true);
  }

  return (
    <>
      <Container maxWidth="lg" className={classes.container}>
        <Typography id="checkInMessage">My Starbucks Check in postory...</Typography>
        <Button id="checkinAdd" variant="outlined" onClick={() => setOpen(true)}><AddIcon /></Button>
        <div className="wrapCard">
          {PostData.length > 0
            ? PostData.map((post, id) => {
              console.log(post)
              return (
                <Card key={id} className={classes.root} onClick={handleClickCard}>
                  <CardActionArea>
                    {imgFromS3 && imgFromS3[id]
                      ? (<CardMedia
                          className={classes.media}
                          image={`data:img/jpg;base64,${imgFromS3[id]}`}
                          title={post["image"]}
                        />)
                      : <></>
                    }
                    <CardContent>
                      <Typography variant="caption" color="textSecondary" component="div">{moment(post.updated_at).format('YYYY/MM/DD ddd HH:mm')}</Typography>
                      <Typography gutterBottom variant="body2" component="div">{post.author}</Typography>
                      {post.comments
                        ? <Typography variant="body2" component="div">{post.comments}</Typography>
                        : <></>
                      }
                      {post.snshandle
                        ? <Typography variant="caption" color="textSecondary" component="div">@{post.snshandle}</Typography>
                        : <></>
                      }
                    </CardContent>
                  </CardActionArea>
                </Card>
              )
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
      <ConfirmDialogCheckIn 
        isConfirmOpen={isConfirmOpen}
        setIsConfirmOpen={setIsConfirmOpen}
      />
    </>
  );
}

export default CheckIn;
