import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import theme from '../../theme';
import '../../index.css'

const useStyles = makeStyles(() => ({
  container: {
    height: '100vh',
    padding: theme.spacing(3),
    backgroundImage: 'url("/img/about.jpg")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: "center center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    padding: theme.spacing(4),
    background: "rgba(255, 255, 255, 0.8)",
    boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  }
}));

const About = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.container}>
      <div className={classes.card}>
      <Typography>
        後日アップデート予定！<br />
        <br />
        * お断り *<br />
        関係のない写真が投稿されているのを発見した場合、こちらで投稿を削除させていただく場合があります。<br />
        あらかじめご了承ください。<br />
      </Typography>
      </div>
    </Container>
  );
}

export default About;
